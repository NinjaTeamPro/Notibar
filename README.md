# Notibar — WordPress Notification Bar

**Multiple notification bars with React-powered Customizer editor, live preview, rotation mode, and per-bar display rules.**

Current version: **3.1.2** | Minimum PHP: **5.3.1** | Minimum WP: **4.0** | Tested to: **7.0**

https://ninjateam.org/notibar-wordpress-notification-bar/

---

## Overview

Notibar lets you create and manage **multiple notification bars** independently — each with its own content, styling, display rules, and behavior. Configure everything inside the native WordPress Customizer with **instant live preview**, no coding required.

### Key Features

- **React-powered Customizer editor** with real-time preview
- **Multiple bars** at once; each with independent rules
- **Per-bar display rules**: all pages, none, or specific include/exclude lists
- **Device-aware content**: desktop & mobile with separate text/buttons
- **Button action**: each button opens a link or dismisses the bar (close action)
- **Button animations** (Pro): per-button attention loop (wobble, pulse, tada, heartbeat…) + hover effect (grow, glow, slide-fill…); CSS-only, respects `prefers-reduced-motion`
- **Flexible close button**: disable, toggle (collapse), or close permanently
- **Rotation mode** (Pro): cycle through bars with pause-on-hover; manual prev/next arrows + keyboard nav; respects `prefers-reduced-motion`
- **Scheduling**: date ranges, daily time windows, specific days of week
- **Advanced targeting** (Pro): CPT types, roles, user lists, audience segments
- **Event tracking** (Pro): track clicks, dismissals, engagement with analytics
- **WPML integration**: register & translate per-bar strings
- **Theme compatibility**: 11+ theme positioning patches built-in
- **Export/Import**: back up all settings or move between sites

---

## Getting Started

### Installation

1. Upload the `notibar` folder to `/wp-content/plugins/`
2. Activate from **Plugins** > **Notibar**
3. Go to **Appearance** > **Customize** > **Notibar Bars** to create your first bar
4. Or visit **Notibar** > **Settings** (admin menu) for export/import & tracking

### Quick Config

1. **Create a bar** → "Add new bar" in Customizer panel
2. **Set content** → Desktop/mobile text, button URL, button label
3. **Style it** → Pick colors, font size, position (top/bottom, fixed/absolute)
4. **Set rules** → Choose which pages/posts display it; who sees it (Pro)
5. **Publish** → Save in Customizer; live immediately

For more examples and use cases, see [docs/project-overview-pdr.md](./docs/project-overview-pdr.md#typical-use-cases).

---

## Architecture at a Glance

### Data Model

- **Storage**: `wp_options` keys `njt_nofi_bars` (JSON array) + `njt_nofi_global` (JSON)
- **Bar object**: id, name, enabled, content (text, button, mobile variants), style (colors, size, position), display rules, behavior (close action, reopen days), schedule
- **Global config**: display mode (single/rotation), rotation interval, pause-on-hover & show-arrows (Pro)

### Bootstrap & Hooks

1. **plugins_loaded (pri 5)**: migrations (v2→v3, theme_mod→options)
2. **plugins_loaded (pri 10)**: core init — classes, Customizer panel, frontend render gate, i18n, tracking (Pro)
3. **rest_api_init**: register 5 REST controllers (posts, users, settings, tracking Pro, export/import)
4. **wp**: frontend renders bars into `#njt-notibar-slot` with data + render script
5. **wp_footer (pri 5)**: inject frontend render data for JS

### Tech Stack

| Layer | Tech | Notes |
|-------|------|-------|
| **Backend** | PHP 5.3.1+ | PSR-4 namespaced; `NjtNotificationBar\` |
| **Admin UI** | React 18 (via @wordpress/element) | SPA in Customizer, settings page |
| **Frontend JS** | Vanilla JS | No deps; handles filtering, rotation, dismissal, tracking |
| **Styling** | SCSS (built to CSS) | Custom properties for colors; z-index 10000 |
| **i18n** | wp_i18n (React); wp_kses, esc_* (PHP) | WPML bridge for per-string translation |
| **Build** | @wordpress/scripts v27 | 4 entry points: customizer-app, customizer-preview, frontend, settings-app |
| **Tracking** (Pro) | Custom DB table + option store | Click/dismiss/engage events; no PII or IP logging |

### Directory Map

```
notibar/
├── njt-notification-bar.php          Main plugin file; bootstrap & hooks
├── README.md                         This file
├── includes/
│   ├── Plugin.php                    Main singleton
│   ├── I18n.php                      Text domain loading
│   ├── edition.php                   NJT_NOFI_IS_PRO constant
│   ├── bar-registry-api.php          njt_nofi_register_bar() global helper
│   ├── NotificationBar/
│   │   ├── BarRegistry.php           Registry/merge/normalize 3rd-party bars
│   │   ├── Schema.php                Data structure & defaults (+ sanitizeExternalBar)
│   │   ├── Schema.php                Data structure & defaults
│   │   ├── SchemaSanitizers.php      Field sanitization (trait)
│   │   ├── AssetLoader.php           JS/CSS enqueue + boot data
│   │   ├── NotificationBarHandle.php Frontend render gate
│   │   ├── WpCustomNotification.php  Customizer panel setup
│   │   ├── Migration.php             v2→v3 & theme_mod→options
│   │   ├── EventCounter.php          Tracking: lifetime counters (Pro)
│   │   ├── EventLog.php              Tracking: raw event table (Pro)
│   │   ├── TrackingCron.php          Daily prune hook (Pro)
│   │   ├── RestPostsController.php   Search posts/pages/CPTs
│   │   ├── RestUsersController.php   Search users (Pro)
│   │   ├── TrackingRestController.php Track events; stats (Pro)
│   │   ├── RestSettingsController.php Export/import settings
│   │   ├── WpmlBridge.php            WPML string registration
│   │   ├── PolylangBridge.php        Polylang (stub)
│   │   ├── WpCustomControl*.php      Customizer field controls (14 files)
│   │   └── overrideOldVer.php        Legacy v1→v2 (removal candidate)
│   └── index.php
├── src/
│   ├── customizer-app/               React SPA for Customizer panel
│   │   ├── App.jsx, BarList, BarEditor (list & edit modes)
│   │   ├── components/tabs/          ContentTab, DisplayTab, StyleTab, BehaviorTab
│   │   ├── components/fields/        AsyncPostPicker, ColorPresetSwatches, etc. (13 files)
│   │   ├── store/                    Customizer state & bridge
│   │   ├── utils/                    create-bar, defaults, update-path, uuid, wcag-contrast (6 files)
│   │   └── hooks/use-rest-search.js
│   ├── customizer-preview/           Customizer iframe live preview
│   ├── settings-app/                 React app for admin Settings page
│   │   ├── App.jsx
│   │   ├── tabs/ExportImportTab.jsx, TrackingTab.jsx
│   │   └── index.js
│   ├── frontend/                     Vanilla JS for public site
│   │   ├── index.js                  Init, filtering, render, rotation
│   │   ├── cookies.js                Dismiss state
│   │   ├── theme-compat.js           11 theme positioning patches
│   │   └── theme-compat/             Per-theme overrides
│   └── shared/                       Cross-app utilities
│       ├── filter-bars.js            Core filtering logic
│       ├── render-bar.js             HTML generation & escaping
│       ├── rotation.js               Rotation (Pro)
│       ├── nav-controls.js           Prev/next arrow markup + injection (Pro)
│       ├── body-push.js              ResizeObserver layout adjust
│       ├── charts/                   Analytics (Pro)
│       ├── escape-utils.js           Text escaping
│       ├── pro-ui.jsx                Go Pro badges & locks
│       └── preview-styles.js
├── build/                            Compiled JS/CSS (4 entry points)
│   └── *.asset.php                   Webpack manifests with deps
├── assets/
│   └── frontend/css/notibar.css      Stylesheet (not used; CSS built into frontend.js)
├── recommended-modules/              Synced modules (auto-ignored)
│   ├── review/                       Rate-plugin nag
│   ├── edd-license-manager/          Pro license (EDD)
│   └── filebird-*/                   Cross-promotion widgets
├── build-tools/
│   ├── strip-pro.js                  Remove Pro code for Lite build
│   ├── edition.lite.php              Lite edition constant
│   └── pro-manifest.json             Pro files/markers to strip
├── i18n/languages/                   Translation files
├── bin/
│   ├── pull-modules.php              Sync recommended-modules
│   └── verify-modules-sync.sh
├── docs/                             Documentation
│   ├── project-overview-pdr.md
│   ├── code-standards.md
│   ├── codebase-summary.md
│   ├── system-architecture.md
│   └── project-roadmap.md
├── setup.sh                          Install deps & setup
├── dev.sh                            npm start watch
├── release.sh                        Build releases
├── uninstall.php                     Cleanup on plugin uninstall
└── modules.json                      Module sync config
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| **[project-overview-pdr.md](./docs/project-overview-pdr.md)** | Product overview, Lite vs Pro feature matrix, PDR requirements |
| **[code-standards.md](./docs/code-standards.md)** | PHP/JS conventions, PSR-4 namespacing, modularization, escaping |
| **[codebase-summary.md](./docs/codebase-summary.md)** | Directory map, per-module descriptions, recommended modularization |
| **[system-architecture.md](./docs/system-architecture.md)** | Bootstrap flow, data model schema, REST API, tracking, render pipeline |
| **[project-roadmap.md](./docs/project-roadmap.md)** | Release history, current milestones, known stubs, future work |

---

## Development

### Setup

```bash
./setup.sh              # Install PHP/Node, create .env, pull modules
./dev.sh               # npm start watch (compiles on file change)
```

### Build

```bash
npm run build          # Create optimized bundle
npm run lint:js        # Check code style
npm run format         # Auto-format src/
```

### Release

```bash
./release.sh           # Build notibar-pro-{VERSION}.zip (includes modules)
./release.sh --lite    # Build notibar-lite-{VERSION}.zip (Pro code stripped)
```

### Key Dev Facts

- **Entry points**: 4 separate bundles (customizer-app, customizer-preview, frontend, settings-app)
- **No Redux**: State via custom hooks (`useBars()`, `useGlobal()`)
- **Lite vs Pro**: Single constant `NJT_NOFI_IS_PRO`; build-time code removal via `@pro…@endpro` markers
- **Modules**: Synced at build time (filebird, review, EDD license for Pro)
- **React deps**: @wordpress/element, @wordpress/i18n, @wordpress/components, @dnd-kit (drag reorder), chart.js (Pro)

---

## Edition System

### Pro vs Lite

- **Single source**: Same codebase for both
- **Edition flag**: `NJT_NOFI_IS_PRO` (true in source, false in Lite build)
- **Code stripping**: `build-tools/strip-pro.js` removes Pro-only files + `@pro…@endpro` blocks during Lite build
- **UI**: Pro controls stay visible but locked with "Go Pro" badge in Lite
- **Lite menu**: "Go Pro" action link + submenu in admin
- **Auto-deactivate**: Pro deactivates Lite on Pro activation + every admin load

### Pro Features

- **Tracking**: Click/dismiss/engage events; analytics dashboard
- **Audience targeting**: Roles, specific users, logged-in/out
- **CPT support**: Display rules by custom post type
- **User search**: AsyncUserPicker in display rules
- **Rotation**: Cycle through bars; pause-on-hover
- **Button animations**: Per-button attention loop (14 presets) + hover effect (8 presets); CSS-only, reduced-motion aware
- **Export/Import**: (both editions have this; Lite restricted to UI-only view)

---

## Tracking (Pro Only)

- **Storage**: `wp_options` `notibar_counters` (lifetime) + custom table `{prefix}notibar_events` (time-series)
- **Events**: click, dismiss, engage; captured by event type + bar ID
- **No PII**: Only `is_logged_in` boolean; no IP, user ID, or external calls
- **Daily prune**: Retains 90 days by default (configurable); runs via `wp-cron`
- **API**: `/notibar/v1/stats/{bar_id}`, `/stats/timeseries?from&to&interval=day`

---

## i18n & Translations

- **Text domain**: `notibar`
- **Language path**: `/i18n/languages/`
- **WPML**: Registers 6 strings per bar (text, textMobile, button text/URL, buttonMobile text/URL) on customize save
- **Polylang**: Stub (full integration deferred; Polylang lacks per-string unregister API)

---

## Integration / Hooks for Developers

Plugins and themes can inject custom notification bars into Notibar's render pipeline. Injected bars inherit all native Notibar features: rendering, scheduling, display rules, dismissal, rotation, and navigation arrows.

### Declaring Bars via PHP

Call `njt_nofi_register_bar()` on the `init` hook or earlier:

```php
add_action( 'init', function () {
    njt_nofi_register_bar( [
        'id'      => 'acme-sale-2026',
        'content' => [
            'text'   => 'Big summer sale!',
            'button' => [
                'enabled' => true,
                'text'    => 'Shop Now',
                'url'     => '/sale'
            ]
        ],
        'style' => [
            'bgColor'    => '#111111',
            'textColor'  => '#ffffff'
        ],
        'display' => [
            'pageLogic' => 'include',
            'pageIds'   => [ 12, 45 ]
        ]
    ] );
} );
```

**Parameters**:
- `id` (required, string): Stable unique identifier; charset [A-Za-z0-9_-]. Bars without a valid id are skipped.
- Other fields (optional): `content`, `style`, `display`, `behavior`, `schedule`. Missing fields are filled from plugin defaults.

### Filter Hook

Add bars via the `njt_nofi_register_bars` filter (additive-only, receives empty array):

```php
add_filter( 'njt_nofi_register_bars', function ( array $bars ) {
    $bars[] = [
        'id'      => 'my-bar',
        'content' => [ 'text' => 'Hello world' ]
    ];
    return $bars;
} );
```

### Guarantees

- **Native bars protected**: Admin-created bars cannot be removed or altered by 3rd parties. On id collision, native bars take precedence.
- **Edition parity**: Injected bars obey identical Lite/Pro gating as native bars. Pro-only fields (bottom placement, CPT/audience targeting, rotation) are active only in Pro, inert in Lite. No Pro bypass.
- **Cache-safe**: Targeting via the bar's own `display` rules, not PHP conditionals.
- **Code-owned**: Declared bars are not editable in Customizer, not shown in Customizer preview, not included in export/import.
- **Render order**: Injected bars render after native bars.

### Dynamic Content Tokens (Pro)

Notibar bars support server-side merge tags in text fields. The syntax is `{token}` or `{token|fallback}` — e.g., "Welcome back, {user_first_name|friend}!". Built-in tokens cover **visitor** (`{user_first_name}`, `{user_last_name}`, `{user_display_name}`, `{user_role}`, `{visitor_country}`), **date/time** (`{current_date}`, `{current_time}`, `{current_day}`, `{current_month}`, `{current_year}`), **site** (`{site_name}`, `{site_tagline}`, `{users_count}`, `{posts_count}`), **current post** (`{post_title}`, `{post_author}`, `{post_category}`, `{post_date}`), and **WooCommerce** (`{recently_viewed_product}`).

Register custom tokens via the `njt_nofi_dynamic_tokens` filter:

```php
add_filter( 'njt_nofi_dynamic_tokens', function ( array $tokens, array $ctx ) {
    $tokens['product_count'] = static function ( array $ctx ): string {
        if ( ! function_exists( 'wc_get_product_count' ) ) {
            return '';
        }
        return (string) wc_get_product_count();
    };
    return $tokens;
}, 10, 2 );
```

**Token callback signature**: `callable( array $ctx ): string` — receives render context (pageId, postId, theme, etc.); returns the token's resolved value as a string, or empty string if unavailable. The resolver uses the returned value or the fallback (if provided).

**Escaping**: HTML fields (content.text, content.textMobile) are esc_html'd; button text fields (content.button.text, content.buttonMobile.text) are not (escaped client-side at render).

**Cache caveat**: If your token returns per-visitor data (e.g., current user, recently viewed), bars will be personalized → bypass full-page cache on pages that show Notibar.

---

## Compatibility

- **WordPress**: 4.0 – 7.0
- **PHP**: 5.3.1 – current
- **Themes**: Core + 11 built-in theme patches (Divi, Essentials, Nayma, Konte, Enfold, Uncode, Uptime Child, Themify Ultra, Salient, Radiate Child, AccessPress Parallax Pro)
- **Plugins**: WPML/ST, WooCommerce (cpt rules), page builders

---

## Support & Contributing

- **Issues & PRs**: GitHub (this repo)
- **Support**: https://ninjateam.org/support
- **Review**: https://wordpress.org/support/plugin/notibar/reviews/

---

## License

GNU General Public License v2.0 or later. See LICENSE.

---

**Built by Ninja Team** — https://ninjateam.org
