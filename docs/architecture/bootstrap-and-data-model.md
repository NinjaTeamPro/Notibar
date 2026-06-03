# Architecture — Bootstrap & Data Model

Part of [system-architecture.md](../system-architecture.md).

## High-Level Architecture

Notibar follows a **three-tier architecture**:

1. **Backend (PHP)**: Data model, REST API, sanitization, migrations
2. **Admin UI (React)**: Customizer panel, settings page, analytics dashboard
3. **Frontend (Vanilla JS)**: Render, filtering, rotation, tracking beacon

Data flows one direction in steady state (options → JSON → settings → output); the Customizer provides bidirectional sync during editing.

---

## Bootstrap Sequence

### Plugin Activation

```
register_activation_hook
  ↓
Plugin::activate()
  ↓
(settings are created on first customize save; activation primarily wires cron/install hooks)
```

### Plugin Load Sequence

```php
plugins_loaded (priority 5) — Migrations run FIRST
  ↓
  Migration::getInstance()->maybeRun()                      // v2.x → v3.0 (one-time)
  Migration::getInstance()->maybeMigrateThemeModToOption()  // v3.1 → v3.1.2

plugins_loaded (priority 10) — Core init
  ↓
  Plugin::getInstance()                          // Main singleton
  I18n::loadPluginTextdomain()                   // Load text domain

  /* @pro */
  EventCounter::maybeInstall()                   // Self-heal counter store
  EventLog::maybeInstall()                       // Self-heal event table
  TrackingCron::registerHook()                   // Bind daily prune callback
  TrackingCron::schedule()                       // Register wp-cron schedule
  /* @endpro */

  AssetLoader::get_instance()                    // Enqueue JS/CSS
  WpCustomNotification::getInstance()            // Register Customizer panel
  NotificationBarHandle::getInstance()           // Frontend render gate
  WpmlBridge::getInstance()                      // i18n bridge (silent if WPML absent)

rest_api_init
  ↓
  RestPostsController::register()                // GET /notibar/v1/posts
  RestUsersController::register()                // GET /notibar/v1/users (Pro)
  TrackingRestController::register()             // POST /track, GET /stats/* (Pro)
  RestSettingsController::register()             // GET /export, POST /import
```

**Order matters**: Migrations run at pri 5 before init at pri 10, ensuring v2 data lands in theme_mod first, then is flipped to option.

Pro also registers `njt_nofi_kill_lite()` on `register_activation_hook` + `admin_init` (pri 0) to auto-deactivate the Lite plugin (`notibar/njt-notification-bar.php`) when Pro is active.

---

## Data Model

### Storage Architecture

**Two JSON objects in wp_options** (multisite-friendly, no theme_mod since v3.1.2):

| Option Key | Type | Purpose | Autoload |
|-----------|------|---------|----------|
| `njt_nofi_bars` | JSON array | Array of bar objects (ordered for rotation) | yes |
| `njt_nofi_global` | JSON object | Global config (display mode, rotation settings) | yes |

**Tracking storage (Pro)**:

| Storage | Key/Table | Type | Purpose | Autoload |
|---------|-----------|------|---------|----------|
| wp_options | `notibar_counters` | JSON object | Lifetime counters by bar_id | no |
| Custom table | `{prefix}notibar_events` | Rows with datetime | Time-series events | — |
| wp_options | `notibar_tracking` | JSON object | Retention days, feature flags | yes |

### Bar Object Schema

```javascript
{
  id: "uuid-v4-string",                  // Unique identifier; generated on create
  name: "Bar name",                       // Display name in list
  enabled: true,                          // Master enable/disable
  order: 0,                               // Order for rotation (sequential mode)

  content: {
    text: "Desktop text",                 // HTML allowed (wp_kses_post sanitized)
    textMobile: "Mobile text",
    mobileSeparate: false,                // If true, use textMobile; else fallback to text
    button: {
      enabled: true,
      text: "Click me",
      url: "https://example.com",
      fontWeight: 400,                    // 100–900
      newWindow: false
    },
    buttonMobile: { /* same shape as button */ }
  },

  style: {
    bgColor: "#9af4cf",                   // Hex color
    textColor: "#1919cf",
    btnBgColor: "#1919cf",
    btnTextColor: "#ffffff",
    fontSize: 15,                         // 8–72 px
    alignment: "center",                  // left|center|right|space-around
    contentWidth: 900,                    // 100–3000 px
    positionType: "fixed",                // fixed|absolute
    placement: "top"                      // top|bottom (Pro can choose; Lite defaults to top)
  },

  display: {
    devices: ["desktop", "mobile"],       // At least one required

    pageLogic: "all",                     // all|none|include|exclude
    pageIds: [1, 5, "home_page"],         // Post IDs; tokens: 'home_page', 'wc_single_product', 'tpl:filename'

    postLogic: "all",
    postIds: [10, 20],

    cptTypes: ["product", "post"],        // Pro: custom post type slugs
    cptLogic: "all",                      // Pro: apply to specific CPTs?
    cptIds: [50, 51],                     // Pro: specific posts within selected CPTs

    audience: "all",                      // all|loggedin|loggedout|roles|users (Pro: roles/users)
    roles: ["editor", "author"],          // Pro: WP role slugs
    userIds: [2, 3]                       // Pro: specific user IDs
  },

  behavior: {
    hideCloseButton: "close",             // close (permanent)|toggle (collapse)|disable (no button)
    reopenAfterDays: 1                    // 0 (session)|1–365 (persistent cookie TTL in days)
  },

  schedule: {
    enabled: false,
    useClientTime: false,                 // Server time vs browser time
    startAt: "2026-06-01T00:00",          // datetime-local; "" = no start limit
    endAt: "2026-12-31T23:59",            // "" = no end limit
    dailyWindow: {
      enabled: false,
      start: "09:00",                     // HH:MM (24h); window may wrap past midnight
      end: "17:00"
    },
    daysOfWeek: [0, 1, 2, 3, 4]           // 0=Sun, 6=Sat; empty = all days
  }
}
```

### Global Config Schema

```javascript
{
  displayMode: "single",                 // single|rotation
  rotationIntervalSeconds: 5,            // 2–60 (Pro)
  rotationPauseOnHover: true,            // (Pro)
  rotationOrder: "sequential"            // sequential|random (Pro)
}
```

### Tracking Schema (Pro)

**EventCounter option** (`notibar_counters`):
```javascript
{
  "bar-id-1": { clicks: 123, dismissals: 45, engagements: 67 },
  "bar-id-2": { /* ... */ }
}
```

**EventLog table** (`{prefix}notibar_events`):
```sql
CREATE TABLE {prefix}notibar_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  bar_id VARCHAR(64) NOT NULL,
  event_type TINYINT UNSIGNED,          -- 1=click, 2=dismiss, 3=engage
  is_logged_in TINYINT UNSIGNED,        -- 0=guest, 1=member
  created_at DATETIME,                  -- stored in UTC
  KEY bar_created (bar_id, created_at),
  KEY created (created_at)
);
```

### Migration & Uninstall

- `Migration` (+ `MigrationMapper` trait): one-shot idempotent v2.1.9→v3.0 conversion of ~30 flat `njt_nofi_*` theme_mods into one bar object + global config. Backup in option `njt_nofi_v2_backup`, auto-pruned after 30 days (cron `njt_nofi_prune_v2_backup`). Flags: `njt_nofi_migrated_to_v3`, `njt_nofi_migrated_to_options`.
- `maybeMigrateThemeModToOption()`: v3.1→v3.1.2 storage flip (theme_mod → wp_options).
- `uninstall.php`: removes theme_mods + options (`njt_nofi_v2_backup`, `njt_nofi_migrated_to_v3`, `njt_nofi_wpml_string_map`), user meta, and unschedules cron; multisite-aware.
