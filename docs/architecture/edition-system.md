# Architecture — Edition System (Pro vs Lite)

Part of [system-architecture.md](../system-architecture.md). One codebase produces both editions; Lite is the source tree with Pro code stripped at build time.

## Edition Flag

```php
// includes/edition.php  (source = Pro)
define('NJT_NOFI_IS_PRO', true);   // swapped to false in Lite via build-tools/edition.lite.php
```

Single source of truth. The Lite build replaces the whole file rather than toggling at runtime.

## Lite Build Process (`build-tools/strip-pro.js`)

Operates on a throwaway staging copy — never the working tree:

```
1. Copy source → staging dir
2. Replace includes/edition.php → build-tools/edition.lite.php   (NJT_NOFI_IS_PRO = false)
3. Remove Pro-only files per build-tools/pro-manifest.json, e.g.:
     src/shared/rotation.js
     assets/frontend/js/tracking.js
     includes/NotificationBar/EventCounter.php
     includes/NotificationBar/TrackingRestController.php
     … (EventLog, TrackingCron, RestUsersController, charts, etc.)
4. Strip @pro … @endpro marker regions across .php/.js/.jsx/.scss/.css
5. npm ci && npm run build   (rebuild JS bundles from the stripped tree)
```

No Pro code survives in the final Lite zip.

## Pro Build Process

```
npm ci && npm run build            (all source kept; edition.php = true; @pro blocks intact)
sync recommended-modules           (review, edd-license-manager, filebird-*)
package → release/notibar-pro-{VERSION}.zip   (folder: notibar-pro/)
```

`./release.sh` builds Pro; `./release.sh --lite` builds Lite (`release/notibar-lite-{VERSION}.zip`, folder `notibar/`, for WordPress.org). Version is read from the plugin header (single source of truth) and synced into `readme.txt` Stable tag.

## Runtime Behavior

- **Lite PHP**: `if ( NJT_NOFI_IS_PRO ) { … }` blocks are dead and additionally removed at build.
- **Lite UI**: Pro feature controls remain visible but **locked** — `<ProBadge />` / `<ProUpgradeNotice />` (`src/shared/pro-ui.jsx`), plus a "Go Pro" submenu + action link and the static `GoProPage` comparison page (slug `notibar-go-pro`).
- **Pro-only**: rotation, tracking/analytics, CPT targeting, role/user audience, and bottom placement.
