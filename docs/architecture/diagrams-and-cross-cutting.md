# Architecture — Diagrams & Cross-Cutting Concerns

Part of [system-architecture.md](../system-architecture.md).

## System Architecture Diagram

```mermaid
graph TB
    subgraph Browser["Frontend (Browser)"]
        Init["frontend/index.js<br/>init()"]
        Filter["filter-bars.js<br/>filterBars()"]
        Render["render-bar.js<br/>renderBarHTML()"]
        DOM["#njt-notibar-slot<br/>DOM Injection"]
        Events["Event Listeners<br/>click, dismiss, copy"]
        Track["tracking.js<br/>navigator.sendBeacon"]
        Rotation["rotation.js<br/>Cycle Bars"]
    end

    subgraph PHP["Backend (PHP)"]
        Plugin["Plugin::getInstance()"]
        Handler["NotificationBarHandle<br/>maybeRender()"]
        Schema["Schema<br/>Sanitizers"]
        Migration["Migration<br/>v2→v3"]
    end

    subgraph REST["REST API (notibar/v1)"]
        PostCtrl["RestPostsController"]
        UserCtrl["RestUsersController"]
        TrackCtrl["TrackingRestController"]
        SettingsCtrl["RestSettingsController"]
    end

    subgraph React["Admin UIs (React)"]
        CustomizerApp["customizer-app/<br/>BarEditor"]
        Preview["customizer-preview/<br/>Live Preview"]
        Settings["settings-app/<br/>Analytics"]
    end

    subgraph Storage["WordPress Storage"]
        Opts["wp_options<br/>njt_nofi_bars<br/>njt_nofi_global"]
        Table["Custom Table<br/>notibar_events"]
    end

    Plugin -->|outputs data| Handler
    Handler -->|boots data| Init
    Init --> Filter --> Render --> DOM --> Events
    Events --> Track
    Events --> Rotation

    CustomizerApp -->|setting writes| Opts
    Preview -->|reads settings| Opts
    Settings -->|queries| TrackCtrl

    REST -->|read/write| Opts
    REST -->|read/write| Table

    Migration -->|migrates| Opts
    Schema -->|validates| Opts
    Track -->|POST /track| TrackCtrl
```

## Bootstrap Sequence

```mermaid
sequenceDiagram
    participant WP as WordPress Core
    participant PLG as Plugin
    participant Migrate as Migration
    participant Init as Core Init
    participant Custom as Customizer
    participant REST as REST API

    WP->>PLG: plugins_loaded (pri 5)
    PLG->>Migrate: maybeRun() + maybeMigrateThemeModToOption()
    Migrate->>PLG: v2→v3 complete

    WP->>PLG: plugins_loaded (pri 10)
    PLG->>Init: init()
    Init->>Init: Plugin::getInstance()
    Init->>Init: I18n::loadPluginTextdomain()
    Init->>Init: AssetLoader::get_instance()
    Init->>Init: WpCustomNotification::getInstance()
    Init->>Init: NotificationBarHandle::getInstance()
    Init->>Init: WpmlBridge::getInstance()

    WP->>REST: rest_api_init
    REST->>REST: RestPostsController::register()
    REST->>REST: RestUsersController::register() [Pro]
    REST->>REST: TrackingRestController::register() [Pro]
    REST->>REST: RestSettingsController::register()
```

## Data Flow: Bar Edit → Save → Render

```mermaid
sequenceDiagram
    participant User
    participant Customizer as Customizer Panel (React)
    participant Bridge as customizer-bridge.js
    participant API as Customizer Setting API
    participant Preview as customizer-preview.js
    participant PHP as Backend
    participant Frontend as frontend/index.js

    User->>Customizer: Edit bar field
    Customizer->>Bridge: updatePath(bar, path, value)
    Bridge->>API: wp.customize('njt_nofi_bars').set(newBars)   (debounced 150ms)
    API->>Preview: postMessage setting change
    Preview->>Preview: filterBars() + renderBarHTML() → update preview DOM

    User->>Customizer: Publish
    Customizer->>PHP: Save option njt_nofi_bars (Schema::sanitizeBars)
    PHP->>PHP: customize_save_after → WpmlBridge diff register/unregister

    User->>Frontend: Browser load
    PHP->>Frontend: window.njtNotibarData = { bars, global, ctx }
    Frontend->>Frontend: filterBars() + renderBarHTML() → inject #njt-notibar-slot
```

---

## Performance Characteristics

Qualitative design intent (no benchmark targets are committed in the repo):

| Layer | Characteristic |
|-------|----------------|
| Plugin load | Custom PSR-4 autoloader; REST routes only on `rest_api_init`; frontend assets gated by `shouldRender()`. |
| Frontend render | Dependency-free vanilla JS; filter + render run synchronously on inlined data, no extra HTTP. |
| Analytics bundle | `TrackingCharts` (Chart.js) lazy-loaded only when the Tracking tab opens; charts code-split out of the main bundle. |
| Tracking beacon | `navigator.sendBeacon` — non-blocking, survives navigation. |
| Rotation | CSS keyframe animations; respects `prefers-reduced-motion`. |
| Body push | `ResizeObserver` — fires only on slot size change. |
| REST search | Paginated (`per_page`/`page`), with `hasMore` cursoring. |

## Security

| Layer | Mechanism | Details |
|-------|-----------|---------|
| Input | Sanitization | `wp_kses_post` (HTML text), `sanitize_hex_color` (colors), `intval` + clamp (numbers), enum whitelists, custom `sanitizeIdList` (IDs) |
| Output | Escaping | `esc_html` / `esc_attr` (PHP); `escapeAttr` / `escapeText` (JS); `wp_json_encode` for boot data |
| REST auth | Capability | `edit_theme_options` (Customizer search), `manage_options` (settings, stats) |
| REST nonce | `@wordpress/api-fetch` includes the WP REST nonce automatically |
| `/track` | Anon by design | No nonce/auth (beacon); validated by `bar_id` regex + existence check |
| Storage | Multisite-safe | `wp_options` (not theme_mods) since v3.1.2 |
| Tracking | No PII | Stores only `is_logged_in` boolean; no IP / user_id / email; no external calls |
