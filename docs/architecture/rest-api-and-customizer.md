# Architecture — REST API & Customizer

Part of [system-architecture.md](../system-architecture.md). Namespace for all endpoints: `notibar/v1`.

## REST API

All endpoints require `edit_theme_options` or `manage_options` unless noted. Literal routes are registered before dynamic routes so `/stats/timeseries` and `/stats/by-bar` resolve before `/stats/{bar_id}`.

### RestPostsController — perm `edit_theme_options`

```
GET /notibar/v1/posts?s=query&per_page=20&page=1
  → { items: [...], hasMore: bool }
  Includes synthetic items:
    { id: 'home_page',         title: 'Homepage' }
    { id: 'wc_single_product', title: 'Single Product (WooCommerce)' }
    { id: 'tpl:filename',      title: 'Template: filename' }

GET /notibar/v1/posts/by-ids?ids=1,5,10   → [{ id, title }, ...]
GET /notibar/v1/cpts                       → public CPT slugs (excludes page/post/attachment)
```

### RestUsersController (Pro) — perm `edit_theme_options`, capped 20/page

```
GET /notibar/v1/users?s=query&per_page=20&page=1   → { items: [...], hasMore: bool }
GET /notibar/v1/users/by-ids?ids=2,3,5             → [{ id, title }, ...]
```

### RestSettingsController — perm `manage_options`

```
GET  /notibar/v1/export?include=bars,global,tracking
  → Download JSON (notibar-export-{host}-{date}.json), versioned `_notibar_export_version: 1`

POST /notibar/v1/import   (max 10 MB, schema-validated)
  → { replaced: { bars: count, global: bool, tracking: count } }
```

### TrackingRestController (Pro)

```
POST /notibar/v1/track                 // anon beacon, no nonce/auth
  Body: { bar_id, event: 'click'|'dismiss'|'engage' }
  → validate bar_id regex + existence; logged-in detected via wp_validate_auth_cookie()
  → EventCounter (authoritative; fail = 500) + EventLog (best-effort)

GET /notibar/v1/stats/{bar_id}                                   // manage_options
GET /notibar/v1/stats                                            // manage_options (bulk map)
GET /notibar/v1/stats/timeseries?from&to&bar_id&interval=day     // manage_options
GET /notibar/v1/stats/by-bar?from&to                             // manage_options
```

---

## Customizer Integration

### Panel / Section Structure

```
Section: "Notibar Bars" — njt_nofi_bars_section (priority 1, top of sidebar)
  └─ Control: WpCustomControlNotibarApp  // single React mount for the whole SPA
       • GlobalSettingsPane (displayMode, rotation* )
       • BarList → BarEditor (tabs: Content, Display, Style, Behavior)
```

The React app (`customizer-app`) renders the bar list and per-bar editor inside one control mount — sections are not auto-created per bar.

### Settings & Transport

| Setting | Type | Transport | Sanitizer |
|---------|------|-----------|-----------|
| `njt_nofi_bars` | option | postMessage | `Schema::sanitizeBars()` |
| `njt_nofi_global` | option | postMessage | `Schema::sanitizeGlobal()` |

**postMessage** transport → live preview updates without a full refresh (`customizer-preview` subscribes).

### Control & App Hierarchy

```
WpCustomControlNotibarApp (PHP, extends WP_Customize_Control)
├─ Outputs <div id="njt-notibar-app">
└─ customizer-app bundle enqueued via AssetLoader on customize_controls_enqueue_scripts

customizer-app/App.jsx
├─ Modes: list (BarList) | edit (BarEditor)
├─ State: useBars(), useGlobal()  (backed by Customizer settings via store/customizer-bridge.js)
├─ Debounced writes (150ms), flush on unload; re-entrancy guard for undo/revert
└─ Sends notibar-preview-focus to preview; receives notibar-edit-bar back

BarEditor.jsx → TabPanel
├─ ContentTab   (text, button, mobile variants)
├─ DisplayTab   (devices, page/post rules, CPT, audience)
├─ StyleTab     (colors, font size, alignment, positioning)
└─ BehaviorTab  (close action, reopen days, schedule)
```

### Live Preview (`customizer-preview/index.js`)

- Injects baseline CSS + ensures `#njt-notibar-slot` in the preview iframe.
- On setting change (debounced 50ms): `filterBars()` then rotate or render single.
- Injects an "Edit" pencil affordance per bar; clicking posts `notibar-edit-bar` to the parent so the SPA drills into that bar.
- Focus override: when the SPA is editing a bar it posts `notibar-preview-focus`, and the preview renders only that bar.
