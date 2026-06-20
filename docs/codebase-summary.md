# Codebase Summary & Directory Map

## High-Level Overview

Notibar is a WordPress plugin with a **React-powered admin UI** and **vanilla JS frontend**. It uses **PSR-4 namespacing**, **@wordpress/scripts build tooling**, and a **single-constant edition system** (Pro vs Lite).

**Key numbers**:
- **~35 PHP files** (~5K LOC, well-modularized <200 LOC each)
- **~50 JS/JSX files** (~3K LOC, <150 LOC each)
- **4 React apps** (Customizer panel, preview, settings, charts)
- **5 REST controllers** (posts, users, settings, tracking, export/import)
- **Custom DB table** for event tracking (Pro)
- **12 theme compatibility patches** built-in

---

## Directory Map

### Root Level

| File/Dir | Purpose |
|----------|---------|
| **njt-notification-bar.php** | Main plugin file; bootstrap, hooks, constants |
| **index.php** | Empty marker (WordPress convention) |
| **uninstall.php** | Cleanup on plugin deletion (options, metadata) |
| **README.md** | User-facing overview & quick start |
| **package.json** | npm config; @wordpress/scripts v27 |
| **setup.sh** | Install deps, create .env, pull modules |
| **dev.sh** | npm start (watch/recompile) |
| **release.sh** | Build Pro/Lite releases to release/ |
| **modules.json** | Synced module config (filebird, review, EDD) |
| **.env** | Build-time secrets (GITHUB_TOKEN for module sync) |
| **.gitignore** | Excludes node_modules, recommended-modules, src/, build-tools/ |

### `/includes` — Backend (PHP)

**Root classes & API** (singleton services + helper):

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **Plugin.php** | `Plugin` | Singleton; activate/deactivate hooks | ~50 |
| **I18n.php** | `I18n` | Text domain loading | ~25 |
| **edition.php** | constant | Define `NJT_NOFI_IS_PRO` (true in source) | ~5 |
| **bar-registry-api.php** | `njt_nofi_register_bar()` | Global helper for 3rd-party bars (CORE) | ~30 |

**Core data & schema** (`/includes/NotificationBar/`):

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **Schema.php** | `Schema` | Default bar/global objects, enum constants, sanitizeExternalBar() | ~150 |
| **SchemaSanitizers.php** | `SchemaSanitizers` (trait) | Field validation/sanitization callbacks | ~350 |
| **BarRegistry.php** | `BarRegistry` | Registry/merge/normalize 3rd-party bars (CORE) | ~150 |

**Asset management & customization**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **AssetLoader.php** | `AssetLoader` | Enqueue JS/CSS, inject boot data (window.njtNotibarBoot) | ~250 |
| **WpCustomNotification.php** | `WpCustomNotification` | Customizer panel, sections, settings, controls registration | ~120 |
| **WpCustomControl*.php** (14 files) | `WpCustomControl*` | Customizer field controls (color picker, multiselect, React mount) | ~50 each |

**Frontend rendering**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **NotificationBarHandle.php** | `NotificationBarHandle` | Frontend render gate, context, bar filter output | ~280 |
| **NotificationBarHandleAdmin.php** | `NotificationBarHandleAdmin` (trait) | Admin menu, action links | ~110 |

**Migrations & data management**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **Migration.php** | `Migration` | v2→v3 legacy migration, idempotent on-demand | ~280 |
| **MigrationMapper.php** | `MigrationMapper` (trait) | v2 field mapping logic | ~200 |

**REST API controllers**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **RestPostsController.php** | `RestPostsController` | GET /posts, /posts/by-ids, /cpts search | ~280 |
| **RestUsersController.php** | `RestUsersController` | GET /users, /users/by-ids (Pro, edit_theme_options) | ~120 |
| **RestSettingsController.php** | `RestSettingsController` | GET /export, POST /import (manage_options) | ~200 |
| **TrackingRestController.php** | `TrackingRestController` | POST /track, GET /stats/* (Pro, anon beacon + admin stats) | ~300 |

**Tracking (Pro only)**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **EventCounter.php** | `EventCounter` | Lifetime counters via option notibar_counters (autoload false) | ~150 |
| **EventLog.php** | `EventLog` | Custom table {prefix}notibar_events, time-series, prune | ~280 |
| **TrackingCron.php** | `TrackingCron` | Daily prune schedule registration & execution | ~60 |
| **TrackingSettings.php** | `TrackingSettings` | Retention days config (option notibar_tracking) | ~50 |

**i18n & multi-language**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **WpmlBridge.php** | `WpmlBridge` | Register 6 strings/bar in WPML ST on save; resolve via filter | ~230 |
| **PolylangBridge.php** | `PolylangBridge` | Stub; detects pll_register_string but no hooks wired | ~50 |

**Legacy & utilities**:

| File | Class | Responsibility | Notes |
|------|-------|-----------------|-------|
| **WpPosts.php** | `WpPosts` | Legacy v2 AJAX handler (no longer used) | ~100 |
| **overrideOldVer.php** | — | v1→v2 legacy override (candidate for removal) | ~500 |
| **NotiHelper.php** | `NotiHelper` | Deprecated v2 helper (no-op in v3) | ~20 |

**Lite build configuration**:

| File | Class | Responsibility | Lines |
|------|-------|-----------------|-------|
| **../build-tools/edition.lite.php** | constant | NJT_NOFI_IS_PRO = false (swap during Lite build) | ~5 |

---

### `/src` — React Apps & Frontend JS

#### **customizer-app/** — Customizer Panel SPA

**Entry & root** (`/src/customizer-app/`):

| File | Responsibility | Lines |
|------|---|---|
| **index.js** | React mount to Customizer control; hydrate boot data | ~20 |
| **App.jsx** | Root component; modes list/edit; TabPanel wrapper | ~50 |

**Components** (`/src/customizer-app/components/`):

| File | Component | Responsibility | Lines |
|------|-----------|---|---|
| **BarList.jsx** | `BarList` | List bars; add button; dnd-kit reorder | ~80 |
| **BarListItem.jsx** | `BarListItem` | Single bar item; name, enabled toggle, delete button | ~60 |
| **BarEditor.jsx** | `BarEditor` | Tab panel for edit mode (Content, Display, Style, Behavior) | ~70 |
| **GlobalSettingsPane.jsx** | `GlobalSettingsPane` | Display mode (single/rotation), rotation interval, pause-on-hover | ~60 |
| **EmptyState.jsx** | `EmptyState` | Empty list message | ~20 |

**Field components** (`/src/customizer-app/components/fields/`):

| File | Component | Responsibility | Lines |
|------|-----------|---|---|
| **AsyncPostPicker.jsx** | `AsyncPostPicker` | Search posts/pages via REST; multi-select | ~90 |
| **AsyncUserPicker.jsx** | `AsyncUserPicker` | Search users (Pro); multi-select | ~90 |
| **ButtonSubForm.jsx** | `ButtonSubForm` | Nested form for button (enable, URL, text, font-weight) | ~80 |
| **ColorFieldWithReset.jsx** | `ColorFieldWithReset` | Color input + reset button | ~60 |
| **ColorPresetSwatches.jsx** | `ColorPresetSwatches` | 8 preset swatches (quick-pick) | ~50 |
| **ContrastWarning.jsx** | `ContrastWarning` | WCAG AA check (4.5:1); inline warning | ~50 |
| **CptMultiSelect.jsx** | `CptMultiSelect` | Public CPT multiselect (Pro) | ~70 |

**Tab components** (`/src/customizer-app/components/tabs/`):

| File | Component | Responsibility | Lines |
|------|-----------|---|---|
| **ContentTab.jsx** | `ContentTab` | Text (desktop/mobile), button subform | ~100 |
| **DisplayTab.jsx** | `DisplayTab` | Device, page/post rules, CPT rules (Pro), audience (Pro) | ~150 |
| **DisplayTabAudienceBlock.jsx** | `DisplayTabAudienceBlock` | Audience picker (logged-in/out, roles, users) | ~80 |
| **DisplayTabCptBlock.jsx** | `DisplayTabCptBlock` | CPT filtering (Pro) | ~60 |
| **StyleTab.jsx** | `StyleTab` | Colors, font size, alignment, position type, content width | ~150 |
| **BehaviorTab.jsx** | `BehaviorTab** | Close actions, reopen days, scheduling | ~120 |

**State & hooks** (`/src/customizer-app/store/`):

| File | Responsibility | Lines |
|------|---|---|
| **use-customizer-state.js** | `useBars()`, `useGlobal()` hooks; read/write Customizer settings | ~60 |
| **customizer-bridge.js** | `readBars()`, `writeBars()`, subscribe/unsubscribe Customizer API | ~80 |

**Utilities** (`/src/customizer-app/utils/`):

| File | Responsibility | Lines |
|------|---|---|
| **create-bar.js** | Factory: new bar with defaults (mirrors PHP Schema::defaultBar) | ~60 |
| **defaults.js** | Default values (align with PHP Schema) | ~80 |
| **update-path.js** | Immutable nested update (e.g., updatePath(bar, 'content.button.text', newText)) | ~50 |
| **reorder.js** | @dnd-kit reorder helper | ~30 |
| **uuid.js** | Wrapper for uuid lib (v14) | ~10 |
| **debounce.js** | Debounce helper (150ms default) | ~20 |
| **wcag-contrast.js** | Calculate contrast ratio; check AA 4.5:1 | ~50 |

**Hooks** (`/src/customizer-app/hooks/`):

| File | Responsibility | Lines |
|------|---|---|
| **use-rest-search.js** | `useRestSearch(endpoint, query)` hook; fetch & debounce | ~70 |

---

#### **customizer-preview/** — Customizer Iframe Preview

| File | Responsibility | Lines |
|------|---|---|
| **index.js** | Listen for setting changes; rerender bars in preview; edit affordance | ~180 |

**Key functions**:
- Inject slot `#njt-notibar-slot` if absent
- Filter bars based on preview context
- Render active bar(s) or rotation
- Listen for postMessage "notibar-edit-bar" (pencil icon click → drill into App edit mode)
- Debounced 50ms

---

#### **settings-app/** — Admin Settings Page

**Entry & root** (`/src/settings-app/`):

| File | Component | Responsibility | Lines |
|------|-----------|---|---|
| **index.js** | React mount to #njt-notibar-settings-app | ~15 |
| **App.jsx** | Root; TabPanel for Tracking (Pro) & Export/Import | ~40 |

**Tabs** (`/src/settings-app/tabs/`):

| File | Component | Responsibility | Lines |
|------|-----------|---|---|
| **TrackingTab.jsx** | `TrackingTab` | Lazy-load TrackingCharts (Pro); demo locked preview (Lite) | ~80 |
| **ExportImportTab.jsx** | `ExportImportTab` | Download JSON; upload preview; confirm import | ~150 |

---

#### **shared/** — Cross-app Utilities

**Core logic** (`/src/shared/`):

| File | Responsibility | Lines |
|------|---|---|
| **filter-bars.js** | `filterBars(bars, ctx)` — apply all display rules; core filtering | ~250 |
| **render-bar.js** | `renderBarHTML(bar, global)` — generate HTML; CSS custom props; escaping | ~200 |
| **rotation.js** | `startRotation(bars, global)` — cycle bars; pause-on-hover (Pro) | ~150 |
| **nav-controls.js** | `buildNavControls(global)` — build & inject prev/next arrow markup (Pro) | ~80 |
| **body-push.js** | `installBodyPush(slot)` — ResizeObserver syncs body padding | ~80 |
| **escape-utils.js** | `escapeText()`, `escapeAttr()`, `decodeBasicEntities()` | ~70 |
| **pro-ui.jsx** | `ProBadge`, `ProUpgradeNotice`, `isProEdition` export | ~80 |
| **preview-styles.js** | `injectPreviewStyles()` — inject CSS into preview iframe | ~40 |

**Charting** (`/src/shared/charts/`, Pro):

| File | Responsibility | Lines |
|------|---|---|
| **tracking-charts.jsx** | `TrackingCharts` (lazy default); filter form, chart tabs | ~100 |
| **chart-filters.jsx** | `ChartFilters` — date range, bar, audience, event type | ~80 |
| **trend-chart.jsx** | `TrendChart` — line+area, daily aggregate (click/dismiss/engage) | ~60 |
| **event-breakdown-chart.jsx** | `EventBreakdownChart` — doughnut, event type split | ~60 |
| **bar-comparison-chart.jsx** | `BarComparisonChart` — grouped bar, per-bar lifetime counts | ~70 |
| **chart-registry.js** | Chart.js config (colors, plugins, tooltip format) | ~60 |
| **timeseries-transform.js** | Aggregate /timeseries & /stats/by-bar responses; filter by audience/events | ~180 |
| **demo-data.js** | DEMO_BARS, DEMO_TIMESERIES (for Lite preview) | ~100 |

---

#### **frontend/** — Public Site JS

| File | Responsibility | Lines |
|------|---|---|
| **index.js** | Init on `wp` hook; filter bars, render, handle dismissal, rotation, tracking | ~200 |
| **cookies.js** | `isDismissed()`, `dismiss()` — manage njt-notibar-{id} cookies | ~60 |
| **theme-compat.js** | Load & apply theme-specific positioning patches | ~100 |

**Theme patches** (`/src/frontend/theme-compat/`):

| File | Themes | Responsibility | Lines |
|------|--------|---|---|
| **divi.js** | Divi, Divi Child | Position overrides | ~30 |
| **essentials.js** | Essentials (pixfort) | CSS margin-top sync for sticky header | ~44 |
| **brandy.js** | Brandy (YayCommerce FSE) | CSS top override via `makeBarOffsetStyleSync` factory | ~37 |
| **nayma-konte.js** | Nayma, Konte | Position overrides | ~40 |
| **enfold-uncode.js** | Enfold, Uncode | Position overrides | ~40 |
| **misc-themes.js** | Uptime Child, Themify Ultra, Salient, Radiate Child, AccessPress Parallax Pro | Collective patches | ~80 |
| **helpers.js** | Utility functions | `setStyles()`, `barHeight()`, `hasAdminBar()`, `makeBarOffsetStyleSync()` factory | ~136 |

---

### `/build` — Compiled Output

**Generated by @wordpress/scripts** (do NOT edit directly):

| File | Purpose |
|------|---------|
| **customizer-app.js** | Customizer panel SPA; require-tree collapsed |
| **customizer-app.css** | Customizer panel styles |
| **customizer-app.asset.php** | Webpack manifest (deps: @wordpress/element, @wordpress/components, etc.) |
| **customizer-preview.js** | Preview iframe logic |
| **frontend.js** | Public site JS (filter, render, rotation, tracking) |
| **frontend.css** | Public site styles (z-index, animations, layout) |
| **settings-app.js** | Admin settings page SPA |
| **settings-app.css** | Settings page styles |

**Also generated**: RTL variants (if applicable), source maps (.map files), code-split chunks.

---

### `/assets` — Static Assets

| File | Purpose | Status |
|------|---------|--------|
| **/frontend/css/notibar.css** | Base stylesheet | Not used (CSS built into frontend.js) |
| **/frontend/js/tracking.js** | Tracking beacon (static, not built) | ✓ Used; static import in frontend.js |

---

### `/recommended-modules` — Synced Dependencies

**Auto-ignored** (.gitignore); synced at build time via modules.json:

| Module | Purpose | Included |
|--------|---------|----------|
| **review/** | Rate-plugin nag (YayCommerce review module) | Both editions |
| **edd-license-manager/** | Pro license validation, auto-update, seat limits | Pro only |
| **filebird-dashboard-widget/** | FileBird cross-promotion | Both (if FileBird absent) |
| **filebird-plugins-page-notification/** | FileBird notification | Both (if FileBird absent) |
| **filebird-sidebar-popup/** | FileBird sidebar | Both (if FileBird absent) |

**Sync mechanism**: `bin/pull-modules.php` runs `git sparse-checkout` + `rsync` (requires GITHUB_TOKEN in .env).

---

### `/build-tools` — Lite Build & Release

| File | Purpose |
|------|---------|
| **strip-pro.js** | Node script; removes Pro code for Lite build |
| **edition.lite.php** | Lite edition constant (NJT_NOFI_IS_PRO = false) |
| **pro-manifest.json** | List of Pro files & @pro markers to strip |

---

### `/i18n/languages` — Translations

| File | Purpose |
|------|---------|
| **notibar.pot** | Translation template (strings extracted from JS build) |
| **notibar-*.po** | Per-language translations (e.g., notibar-de_DE.po) |
| **notibar-*.mo** | Compiled translations |

---

### `/bin` — Utility Scripts

| File | Purpose |
|------|---------|
| **pull-modules.php** | Sync recommended-modules from YayCommerce/cross-sell-manager |
| **verify-modules-sync.sh** | Verify module sync integrity |

---

### `/docs` — Documentation

| File | Purpose |
|------|---------|
| **README.md** | User overview, features, install |
| **project-overview-pdr.md** | Product definition, requirements, edition matrix |
| **code-standards.md** | PHP/JS conventions, naming, best practices |
| **codebase-summary.md** | This file; directory map & module descriptions |
| **system-architecture.md** | Bootstrap flow, data model, REST API, render pipeline |
| **project-roadmap.md** | Release history, milestones, known stubs |

---

## Module Recommendations

### Modularization Opportunities

**Current status**: Well-modularized overall; a few candidates for further splitting:

1. **NotificationBarHandle.php** (280 LOC)
   - **Split candidate**: Separate render context builder into new class `RenderContextFactory`
   - **Reason**: ~80 LOC for context assembly; domain separate from render gate
   - **Impact**: Easier testing, cleaner dependencies

2. **BarEditor.jsx** (if >150 LOC)
   - **Split candidate**: Extract each tab into separate file (ContentTab, DisplayTab already split; but BarEditor wrapper can slim down)
   - **Current**: Likely <150 LOC after tab extraction; monitor on next refactor

3. **TrackingCharts.jsx** (Pro, if grows >100 LOC)
   - **Split candidate**: Extract filter form into separate `ChartFilters` component (already done; good)
   - **Status**: Already modularized; no action needed

4. **filter-bars.js** (250 LOC)
   - **Status**: Pure function; logic-heavy but focused; acceptable at 250 LOC
   - **Alternative split**: Extract schedule logic into `filterBySchedule()` subfunction (minor gains)
   - **Recommendation**: Monitor; refactor only if sub-concerns arise

5. **Migration.php** (280 LOC)
   - **Status**: Legacy v2→v3 one-time migration; rarely touched
   - **Recommendation**: Leave as-is (low change frequency); mark for removal candidate post-v3.2

### File Size Summary

| Category | Count | Avg LOC | Status |
|----------|-------|---------|--------|
| PHP classes | 35 | 130 | ✓ Good; all <200 |
| React components | 25 | 80 | ✓ Good; all <150 |
| Shared JS | 10 | 120 | ✓ Good; filter-bars.js at limit |
| Utility JS | 8 | 40 | ✓ Good; small helpers |

---

## Dependency Graph (High-Level)

```
njt-notification-bar.php (main)
├─ includes/Plugin.php
├─ includes/I18n.php
├─ includes/bar-registry-api.php
├─ includes/NotificationBar/
│  ├─ BarRegistry.php
│  ├─ Schema.php + SchemaSanitizers.php (trait)
│  ├─ AssetLoader.php
│  │  └─ (enqueues 4 React bundles + tracking.js)
│  ├─ WpCustomNotification.php
│  │  └─ WpCustomControl*.php (14 custom controls)
│  ├─ NotificationBarHandle.php + NotificationBarHandleAdmin.php (trait)
│  │  └─ (renders bars on wp hook)
│  ├─ Migration.php + MigrationMapper.php (trait)
│  ├─ EventCounter.php (Pro)
│  ├─ EventLog.php (Pro)
│  ├─ TrackingCron.php (Pro)
│  ├─ RestPostsController.php (REST /posts, /cpts)
│  ├─ RestUsersController.php (REST /users, Pro)
│  ├─ RestSettingsController.php (REST /export, /import)
│  ├─ TrackingRestController.php (REST /track, /stats, Pro)
│  ├─ WpmlBridge.php (optional, if WPML active)
│  └─ PolylangBridge.php (stub)
└─ recommended-modules/
   ├─ review/ (feedback nag)
   ├─ edd-license-manager/ (Pro license)
   └─ filebird-*/ (cross-promotion)

src/
├─ customizer-app/
│  ├─ App.jsx (root)
│  ├─ store/use-customizer-state.js + customizer-bridge.js
│  ├─ components/BarList, BarEditor, GlobalSettingsPane
│  ├─ components/tabs/* (ContentTab, DisplayTab, StyleTab, BehaviorTab)
│  ├─ components/fields/* (13 field components)
│  └─ utils/* (create-bar, update-path, defaults, uuid, etc.)
├─ customizer-preview/index.js
│  └─ (imports shared/filter-bars, shared/render-bar)
├─ frontend/index.js
│  └─ (imports shared/filter-bars, shared/render-bar, rotation, cookies, theme-compat)
├─ settings-app/
│  ├─ App.jsx
│  ├─ tabs/TrackingTab.jsx (lazy imports shared/charts/tracking-charts.jsx, Pro)
│  └─ tabs/ExportImportTab.jsx
└─ shared/
   ├─ filter-bars.js (core filtering)
   ├─ render-bar.js (HTML generation)
   ├─ rotation.js (Pro)
   ├─ nav-controls.js (Pro)
   ├─ body-push.js
   ├─ escape-utils.js
   ├─ pro-ui.jsx
   └─ charts/* (Pro, lazy-loaded)
```

---

## Data Flow Summary

### Bar Creation & Edit

```
User clicks "Add bar" in Customizer
  ↓
BarList.jsx handleAddBar()
  ↓
create-bar.js createBar() → new bar object with defaults
  ↓
useBars() setBars(...)
  ↓
customizer-bridge.js writeBars() (debounced 150ms)
  ↓
Customizer setting 'njt_nofi_bars' updated
  ↓
Post message to preview → customizer-preview rerendered
```

### Frontend Render

```
Page load → wp hook fires
  ↓
NotificationBarHandle.php outputs njtNotibarData to wp_footer
  ↓
frontend/index.js reads window.njtNotibarData
  ↓
filter-bars.js filterBars() → filtered bars
  ↓
render-bar.js renderBarHTML() → HTML string
  ↓
Injected into #njt-notibar-slot
  ↓
Attach event listeners (click, dismiss, copy for tracking)
  ↓
rotation.js startRotation() (if active, Pro)
  ↓
emit njt_nofi_bar_rendered custom event
```

### Tracking (Pro)

```
User clicks button / dismisses / engages
  ↓
frontend/tracking.js captures event
  ↓
navigator.sendBeacon POST /notibar/v1/track
  ↓
TrackingRestController validates & persists
  ↓
EventCounter + EventLog written (dual-write)
  ↓
Daily cron prunes events >90 days
  ↓
Admin views analytics via /notibar/v1/stats/* endpoints
  ↓
TrackingCharts.jsx displays charts
```

---

## Key Insights

1. **Separation of concerns**: Backend (PHP), Admin UI (React), Frontend (vanilla JS), Styling (SCSS/CSS) are well-separated.
2. **Single source of truth**: Customizer settings are authoritative; no local state persisted outside WP.
3. **Lite/Pro split**: Single codebase, build-time stripping via strip-pro.js keeps editions in sync.
4. **REST-centric**: All admin-to-backend communication via REST API; no AJAX (except legacy WpPosts.php).
5. **Modular components**: React components <150 LOC; PHP classes <200 LOC; shared utils well-factored.
6. **No external dependencies on frontend**: Tracking, filtering, rendering all self-contained (no tracker pixel, no third-party JS).
7. **Migration safety**: v2→v3 one-time migration idempotent; v3.1→v3.1.2 storage flip self-healing on upgrade.

---

## Future Refactoring Candidates

1. **Remove overrideOldVer.php** (v1→v2 legacy) — post-v3.2
2. **Complete Polylang integration** — deferred (API limitation)
3. **Extract RenderContextFactory** from NotificationBarHandle.php (minor optimization)
4. **Consolidate theme-compat patches** into config-driven approach (future maintainability)
5. **Add PHPUnit tests** for core logic (Schema, filtering, migration)
6. **Deprecate WpPosts.php** — replace with REST API (already done in v3.0)

---

## References

See also:
- **[README.md](../README.md)** — User overview
- **[code-standards.md](./code-standards.md)** — Coding conventions
- **[system-architecture.md](./system-architecture.md)** — Bootstrap, data model, API details
- **[project-roadmap.md](./project-roadmap.md)** — Release history & future milestones
