# Project Overview & Product Development Requirements

## Project Identity

| Property | Value |
|----------|-------|
| **Name** | Notibar — WordPress Notification Bar |
| **Current Version** | 3.1.2 |
| **Namespace** | `NjtNotificationBar\` (PSR-4) |
| **Text Domain** | `notibar` |
| **Plugin URI** | https://ninjateam.org/notibar-wordpress-notification-bar/ |
| **Author** | Ninja Team |
| **License** | GPL-2.0+ |
| **Min WP Version** | 4.0 |
| **Min PHP Version** | 5.3.1 |
| **Tested Up To** | 7.0 |

---

## Problem Statement

WordPress site owners need an easy, visual way to display important announcements, notifications, and calls-to-action across their site without coding. They want:

1. **Multiple bars** managed independently
2. **Visual editor** with instant preview (no coding)
3. **Flexible display rules** (which pages, who sees it, when)
4. **Professional look** that matches their theme
5. **Advanced features** (tracking, rotation, per-user targeting) for serious use cases

---

## Target Users

- **Primary**: Site owners, marketers, blog editors (non-developers)
- **Secondary**: WooCommerce store owners, newsletter creators, announcement managers
- **Advanced**: Site admins needing audience targeting, analytics, enterprise features (Pro)

---

## Solution Overview

Notibar provides a **React-powered Customizer panel** to visually create & manage notification bars. Each bar has:

- **Independent content** (desktop/mobile text, CTA button)
- **Flexible styling** (colors, font size, position, alignment)
- **Display rules** (pages, posts, CPTs, user roles, specific users)
- **Close behavior** (disable, toggle, permanent)
- **Scheduling** (date ranges, time windows, days of week)
- **Rotation mode** (Pro) for cycling through bars
- **Event tracking** (Pro) for analytics

---

## Edition Strategy

### Notibar Lite (Free)

**Audience**: Core WP users who want basic notification bars without tracking or advanced targeting.

**Features**:
- Create unlimited notification bars
- React Customizer editor with live preview
- Content: desktop/mobile text & button (URL + label)
- Styling: colors, font size, position (fixed/absolute), alignment
- Display rules: pages, posts (by ID include/exclude)
- Close actions: close, toggle, disable
- Scheduling: date ranges, daily windows, specific weekdays
- WPML integration (translate bar text)
- Theme compatibility (11 built-in patches)
- Export/Import (UI-only; no data persistence between sites)

**Locked features** (visible, badged "Go Pro"):
- Rotation mode
- Event tracking & analytics
- Audience targeting (roles, user lists)
- CPT-aware display rules
- Advanced user search
- Polylang translation (stub)

**Distribution**: WordPress.org plugin directory

---

### Notibar Pro

**Audience**: Agencies, high-traffic sites, marketers needing analytics & advanced targeting.

**Additions over Lite**:
- **Rotation mode**: Cycle through bars with pause-on-hover, manual prev/next arrows & keyboard nav; respects `prefers-reduced-motion`
- **Event tracking**: Track clicks, dismissals, engagement per bar; lifetime counters + time-series table
- **Analytics dashboard**: Charts (trend, breakdown by event type, per-bar comparison); filter by date range, bar, audience, event type
- **Audience targeting**: Restrict to logged-in, logged-out, specific roles, specific user IDs
- **CPT rules**: Display by custom post type + per-CPT ID include/exclude
- **User search**: Async user picker for audience targeting
- **License management**: EDD-powered license validation & auto-updates

**Distribution**: ninjateam.org (paid license)

**License**: Item ID 37959 on ninjateam.org EDD store

---

## Feature Matrix

| Feature | Lite | Pro | Notes |
|---------|------|-----|-------|
| Create bars | ✓ | ✓ | Unlimited |
| React Customizer | ✓ | ✓ | Real-time preview |
| Content (text, button) | ✓ | ✓ | Desktop/mobile variants |
| Styling (colors, size, position) | ✓ | ✓ | WCAG AA contrast warning |
| Page/post rules | ✓ | ✓ | Include/exclude by ID |
| Device awareness | ✓ | ✓ | Desktop/mobile separate |
| Close actions | ✓ | ✓ | close/toggle/disable |
| Scheduling | ✓ | ✓ | Date ranges, daily windows, weekday picker |
| WPML integration | ✓ | ✓ | Per-bar string registration |
| Theme compat patches | ✓ | ✓ | 11 built-in themes |
| Export/Import | ✓* | ✓ | *Lite: UI preview only; no import |
| **Rotation mode** | | ✓ | Cycle bars; pause-on-hover; manual prev/next arrows & keyboard nav |
| **Event tracking** | | ✓ | Click, dismiss, engage |
| **Analytics dashboard** | | ✓ | Charts, filters, time-series |
| **Audience targeting** | | ✓ | Roles, user lists, logged-in/out |
| **CPT rules** | | ✓ | Custom post type filtering |
| **User search** | | ✓ | Async picker for users |
| **License management** | | ✓ | Auto-updates, seat limits |

---

## Functional Requirements

### FR1: Bar Management

**Requirement**: Users must create, edit, list, delete, enable/disable bars in Customizer.

- Bar object: id (UUIDv4), name, enabled flag, order (for rotation), content, style, display rules, behavior, schedule
- Create bar: "Add new bar" button → modal → save with defaults
- Edit bar: Click bar in list → 4-tab editor (Content, Display, Style, Behavior)
- Reorder bars: Drag-drop list items
- Delete bar: Confirm prompt → prune from counters & event log
- Publish: Save to Customizer setting → live on frontend

### FR2: Content Editor

**Requirement**: Set desktop/mobile text, CTA button (URL, label, font weight), optional mobile-specific text.

- Text fields support HTML (via wp_kses_post) for rich text
- Button: enable/disable toggle, URL input (esc_url_raw), label (length cap), font weight (100-900)
- Mobile variant: separate text + button; toggle mobileSeparate flag to use or fallback to desktop
- WYSIWYG note: Input fields are plain text; render escapes on output

### FR3: Styling

**Requirement**: Colors, font size, alignment, positioning, content width.

- bgColor, textColor, btnBgColor, btnTextColor: hex color picker (sanitize_hex_color); reset to defaults
- fontSize: 8-72 px range slider
- alignment: left, center, right, space-around (flexbox)
- contentWidth: 100-3000 px slider
- positionType: fixed or absolute toggle
- placement (Pro): top or bottom
- WCAG contrast warning: real-time AA 4.5:1 check (textColor vs bgColor, button text vs btnBgColor)
- 8 color presets: quick-pick swatches

### FR4: Display Rules

**Requirement**: Control which pages/posts show bar and who sees it.

**Pages/Posts**:
- pageLogic: all, none, include, exclude
- pageIds: array of post IDs (synthetic tokens: 'home_page', 'wc_single_product', 'tpl:filename')
- postLogic, postIds: same as pages

**CPTs (Pro)**:
- cptTypes: multiselect of public custom post types
- cptLogic: all, none, include, exclude
- cptIds: array of post IDs in selected CPTs

**Audience (Pro)**:
- audience: all, loggedin, loggedout, roles, users
- roles: multiselect WP roles (Editor, Author, etc.)
- userIds: async user picker (search by name/email)

**Devices**:
- devices: multiselect [desktop, mobile] (at least one required)

### FR5: Behavior

**Requirement**: Control close button, dismissal cookies, reopen.

- hideCloseButton: close (permanent), toggle (collapse/expand), disable (no button)
- reopenAfterDays: 0-365 int (0 = session cookie; 1-365 = persistent)
- Cookie: njt-notibar-{id}=1, SameSite=Lax, Max-Age based on days
- Dismissal state persisted in sessionStorage (within one session)

### FR6: Scheduling

**Requirement**: Date range, daily time window, specific weekdays.

- enabled: toggle
- useClientTime: boolean (server vs client timezone)
- startAt, endAt: ISO 8601 datetime (YYYY-MM-DDTHH:MM)
- dailyWindow: { enabled, start: HH:MM, end: HH:MM }; wraps midnight if needed
- daysOfWeek: array of 0-6 (Sun-Sat)
- Filter applied on frontend; server context sent in boot data

### FR7: Frontend Render

**Requirement**: Filter bars by rules, render active bar(s), handle dismissal, rotation, tracking.

- Init on `wp` hook; read window.njtNotibarData {bars, global, ctx}
- filterBars(): apply device, page/post, CPT, audience, dismissal, schedule logic
- renderBarHTML(): safe innerHTML for content, CSS custom props for colors, aria-live=polite
- Dismiss affordance: click .njt-nofi-close → set cookie/sessionStorage → remove bar
- Rotation: cycle through filtered bars; pause-on-hover; respect prefers-reduced-motion
- Event: emit njt_nofi_bar_rendered on render
- Body push: ResizeObserver → adjust body padding-top/bottom for fixed position
- Theme compat: apply positioning patches for 11 known themes

### FR8: Customizer Integration

**Requirement**: Panel, sections, settings, controls; live preview; undo/revert; publish.

- Panel: "Notibar Bars" (priority 1)
- Sections: per-bar tab sections (Content, Display, Style, Behavior)
- Settings: njt_nofi_bars (type option), njt_nofi_global (type option); transport postMessage
- Control: WpCustomControlNotibarApp (React SPA mount)
- Live preview: customizer-preview.js listens for setting changes → rerender in iframe
- Undo/revert: Customizer native via changeset

### FR9: REST API

**Requirement**: Provide endpoints for Customizer SPA and admin settings.

**RestPostsController** (`notibar/v1/posts`):
- GET /posts: search by title, paginated; return posts + synthetic items (home page, product pages)
- GET /posts/by-ids: bulk fetch by post IDs
- GET /cpts: list public CPT slugs

**RestUsersController** (Pro, `notibar/v1/users`):
- GET /users: search by name/email, paginated
- GET /users/by-ids: bulk fetch by user IDs

**RestSettingsController** (`notibar/v1/settings`):
- GET /export?include=bars,global,tracking: download JSON
- POST /import: upload JSON; validate & merge (returns replaced counts)

**TrackingRestController** (Pro, `notibar/v1/tracking`):
- POST /track: beacon endpoint (anon, no nonce)
- GET /stats/{bar_id}: lifetime counters
- GET /stats: bulk by bar
- GET /stats/timeseries: time-series (daily aggregated)
- GET /stats/by-bar: per-bar lifetime

### FR10: Tracking (Pro)

**Requirement**: Capture & store click, dismiss, engage events; provide analytics.

- **EventCounter**: option store; lifetime totals; atomic JSON_MERGE_PATCH
- **EventLog**: custom table; time-series with UTC timestamps; prune daily (default 90 days)
- **Events**: click (button), dismiss (close), engage (any other click + text copy)
- **Payload**: bar_id, event_type, is_logged_in (boolean only); NO IP, user_id, PII
- **Transport**: navigator.sendBeacon (fallback fetch keepalive)
- **Analytics UI**: TrackingCharts (lazy) with filters (date range, bar, audience, event type)

### FR11: Migration

**Requirement**: Auto-migrate from v2.x to v3.0+; migrate theme_mod to option storage (v3.1.2).

**v2→v3**:
- One-time idempotent migration on plugins_loaded pri 5
- Maps 30+ flat njt_nofi_* theme_mods to single njt_nofi_bars bar + njt_nofi_global
- Creates backup option njt_nofi_v2_backup; prunes after 30 days
- Flags: njt_nofi_migrated_to_v3

**v3.1→v3.1.2**:
- Migrates njt_nofi_bars & njt_nofi_global from theme_mods to options (multisite-friendly)
- One-time on plugins_loaded pri 5
- Flag: njt_nofi_migrated_to_options

### FR12: i18n & Translation

**Requirement**: Text domain loading; WPML string registration; Polylang stub.

**WordPress i18n**:
- Text domain: notibar
- Load textdomain on plugins_loaded
- React: @wordpress/i18n for admin strings

**WPML Integration** (WpmlBridge):
- Registers 6 strings per bar on customize_save_after (if WPML ST active)
- Strings: text, textMobile, button text (desktop & mobile), button URL (desktop & mobile)
- Resolves via filter njt_nofi_resolve_strings → wpml_translate_single_string
- Map stored in option njt_nofi_wpml_string_map
- Silent no-op if WPML/ST missing

**Polylang**:
- Stub in v3.0 (detects pll_register_string, no hooks wired)
- Full integration deferred (Polylang API limitation: no per-string unregister)

---

## Non-Functional Requirements

### NFR1: Performance

- **Frontend JS size**: <50 KB minified (4 entry points combined ~200 KB)
- **Customizer SPA**: Load within 2 seconds (asset manifest deps)
- **REST endpoints**: Respond within 500ms (typical query)
- **Render**: Bar HTML injected into DOM within 100ms of init
- **Rotation**: 60 FPS when cycling bars; CSS animations preferred over JS
- **Tracking**: navigator.sendBeacon (async; non-blocking)

### NFR2: Security

- **Input sanitization**: wp_kses_post (content), sanitize_hex_color (colors), esc_url_raw (URLs), intval (numbers), custom regex (IDs)
- **Output escaping**: esc_html, esc_attr, wp_json_encode (React boot data)
- **REST endpoints**: Require manage_options or edit_theme_options; nonce validation (except /track POST)
- **/track endpoint**: No auth required (anon beacon); validate bar_id regex + existence; rate-limit via built-in WP mechanisms
- **WPML/St**: Only register public strings (no sensitive data)
- **No external calls**: Tracking stays in-house (no pixel, no third-party JS)

### NFR3: Compatibility

- **PHP 5.3.1+**: Use only PHP 5.3 syntax; no type hints, no short array syntax [], no spaceship, no null coalescing
- **WordPress 4.0+**: Use WP APIs, no beta features, avoid deprecated hooks
- **Themes**: 11 built-in patches; detect by wp_get_theme()->get('Name'); position overrides
- **Plugins**: WPML, Polylang (partial), WooCommerce, page builders (theme compat covers most)
- **React**: Use @wordpress/element (React 18 downgrade to 16 available); @wordpress/components, @wordpress/i18n

### NFR4: Scalability

- **Multisite**: Options (not theme_mods) for network-aware storage
- **Tracking table**: Indexed on bar_id, created_at; daily pruning keeps size bounded
- **Rotation**: Efficient filtering on frontend; no server round-trips per rotation tick
- **REST bulk endpoints**: /posts/by-ids, /stats/timeseries server-side aggregation

### NFR5: Maintainability

- **Code organization**: <200 LOC per file; single responsibility; PSR-4 namespace
- **Traits**: SchemaSanitizers, NotificationBarHandleAdmin (shared logic)
- **Tests**: PHPUnit for core logic (not yet in scope)
- **Documentation**: README.md, architecture.md, code standards in ./docs/
- **Build**: Single @wordpress/scripts entry point; strip-pro.js for Lite variant

### NFR6: Accessibility

- **WCAG AA**: Color contrast checker (real-time in Customizer), aria-live=polite on bar, role=status
- **Keyboard**: Focus management in Customizer (React @wordpress/components handles most)
- **Reduced motion**: Rotation respects prefers-reduced-motion media query
- **Screen readers**: Semantic HTML, aria-labels on interactive elements
- **Mobile**: Responsive design; touch-friendly tap targets

---

## Success Criteria

### Release Readiness

1. **Core functionality**: All FR1–FR9 implemented & tested
2. **Pro features**: All FR10–FR11 implemented for Pro builds
3. **No errors**: Zero plugin check warnings; phpcs passes
4. **Migrations**: v2→v3 and v3.1→v3.1.2 tested on real data
5. **REST APIs**: All endpoints respond correctly; nonce validation works
6. **Customizer UX**: Drag-drop reorder, live preview, undo/revert smooth
7. **Frontend render**: Bars display on correct pages; filtering works; dismissal persists
8. **Analytics**: Event tracking (Pro), charts render, time-series aggregation works
9. **i18n**: WPML strings registered & translated; React strings localizable
10. **Compatibility**: Tested on WP 4.0, 7.0, PHP 5.3.1 (strict compatibility)

### User Satisfaction

- Users can create & publish bar in <2 minutes (Customizer UX)
- Bars render with zero layout shift (CSS size constraints)
- On mobile, separate text/button text displays correctly
- Tracking (Pro) shows accurate event counts & charts
- WPML translations appear on frontend
- Export/import preserves all bar settings

### Performance Benchmarks

- Plugin activation <500ms
- Customizer panel load <2 seconds
- Frontend bar render <100ms
- REST /posts search <300ms
- Tracking beacon fire & forget (non-blocking)

---

## Out of Scope (v3.1.2)

- Polylang full integration (stub remains; deferred)
- v1→v2 legacy override.php (removal candidate)
- Custom fonts (beyond system stack)
- Animation library (CSS only)
- A/B testing (rotation is manual)
- Multi-language editorial UI (only English admin)
- Gutenberg block (Customizer panel only)

---

## Public API for 3rd-Party Integrations

Notibar provides a stable public API (both Lite & Pro) for plugins and themes to inject custom notification bars without modifying Notibar's configuration.

**Core entry point**: `njt_nofi_register_bar( array $bar ): void`
- Call on `init` or earlier. Declare a bar with an id (charset [A-Za-z0-9_-]); missing fields inherit defaults.
- Bars without valid id are silently skipped.

**Filter hook**: `apply_filters( 'njt_nofi_register_bars', array $injected ): array`
- Additive-only; seeded with empty array. Integrators append bar objects.
- Native bars are never exposed; filter receives only injected bars.

**Guarantees**:
- Injected bars obey identical Lite/Pro gating as native bars (Pro-only fields inert in Lite).
- Display rules are cache-safe; targeting via `display` object, not PHP conditionals.
- On id collision, native bars take precedence.
- Injected bars are code-owned: not editable in Customizer, not shown in preview, not in export/import.
- Render order: injected bars appear after native bars.

See [../README.md#integration--hooks-for-developers](../README.md#integration--hooks-for-developers) for examples.

---

## Technical Decisions

1. **PSR-4 Namespace**: Isolates from other plugins; single constant edition flag prevents collisions
2. **JSON storage**: Flexible, human-readable export/import; schema versioning via _notibar_export_version
3. **Customizer panel**: Native WP UX; instant preview; no custom admin pages for bar config
4. **React SPA**: Modular UI, state hooks, better DX than jQuery
5. **Frontend vanilla JS**: No deps on runtime; <50 KB; IIFE to avoid globals
6. **Tracking dual-write**: Option (authoritative, fails=500) + table (best-effort); table enables time-series
7. **WPML per-string**: Register on save (not on load) → lighter footprint; only public strings
8. **Theme compat patches**: Whitelist approach (not hacky); covers 95% of top themes
9. **Build: @wordpress/scripts**: Single entry point; automatic split chunks; no manual webpack
10. **Edition system**: source=Pro; build-time strip for Lite (cleaner than runtime if-checks)

---

## Version History

Dates from git commit history (the v3 line was built May–June 2026).

| Version | Date | Highlights |
|---------|------|-----------|
| 3.1.2 | 2026-06-01 | EventLog table, options storage migration, tracking REST endpoints, Pro auto-deactivates Lite |
| 3.1 | 2026-05-30 → 05-31 | EventCounter, tracking infrastructure, Pro analytics (Chart.js) |
| Lite variant | 2026-05-26 → 05-27 | Build-time Pro stripping, Go Pro page, role/user targeting, bottom placement |
| 3.0 | 2026-05-21 → 05-22 | React Customizer SPA, bars in options, WPML bridge, new data model |
| 2.1.9 | Jan 2026 | Last v2 release (public changelog); legacy flat theme_mods |

---

## Appendix: Lite vs Pro at a Glance

### Lite Build Process
```
git source (Pro code + @pro markers)
  → build-tools/strip-pro.js
    → remove Pro files (rotation.js, EventCounter.php, etc.)
    → remove @pro…@endpro blocks (PHP, JS, SCSS)
    → replace includes/edition.php with edition.lite.php
    → rebuild JS
  → notibar-lite-{VERSION}.zip (WordPress.org release)
```

### Pro Build Process
```
git source
  → npm ci & npm run build
  → sync recommended-modules (review, EDD license, filebird)
  → release/notibar-pro-{VERSION}.zip (ninjateam.org release)
```

**Key Difference**: Pro includes EDD license manager, rotation.js, TrackingRestController, EventCounter, EventLog, and all @pro code regions. Lite has Go Pro badges instead.
