# Architecture — Frontend Render Pipeline

Part of [system-architecture.md](../system-architecture.md).

The public-facing bar is rendered entirely client-side from data PHP inlines into the footer. Frontend code is dependency-free vanilla JS; rendering logic is shared with the Customizer preview (`src/shared/`).

## Phase 1 — Context Build (PHP, `wp` hook)

```php
NotificationBarHandle::maybeRender()
  ↓ builds render context:
  {
    pageId, postId,
    isHome: is_home() || is_front_page(),
    isSingleProduct: class_exists('WooCommerce') && is_product(),
    theme: wp_get_theme()->get('Name'),
    serverNow, serverWeekday, serverHHMM,   // server time for schedule eval
    currentCptType: get_post_type(),
    currentObjectId: get_the_ID()
  }
  ↓ on wp_footer (pri 5):
  echo '<div id="njt-notibar-slot"></div>';
  echo '<script>window.njtNotibarData = { bars, global, ctx };</script>';
```

Asset enqueue is gated by `shouldRender()` — a lightweight server pre-filter (enabled, devices, schedule). WPML translations are applied via the `njt_nofi_resolve_strings` filter, and audience filtering (Pro) drops bars the current user can't see before output.

## Phase 2 — Frontend Init (`src/frontend/index.js`)

```javascript
init()
  → read window.njtNotibarData
  → detectDevice(): window.innerWidth <= 480 ? 'mobile' : 'desktop'
  → filterBars(bars, { ...ctx, device, dismissed })   // src/shared/filter-bars.js
```

`filterBars()` applies, in order: `enabled` → device → CPT branch (Pro) → page/post logic (`all|none|include|exclude`) → dismissal (cookies) → schedule (date range, `daysOfWeek`, daily window incl. wrap-midnight, server-vs-client time).

## Phase 3 — Rendering (`src/shared/render-bar.js`)

`renderBarHTML(bar, global)` returns a string injected into `#njt-notibar-slot`. Markup contract:

```html
<div class="njt-nofi-container-content" role="status" aria-live="polite" data-bar-id="…">
  <div class="njt-nofi-container" data-position="fixed|absolute" data-placement="top|bottom">
    <div class="njt-nofi-notification-bar" style="--njt-bar-bg:…; --njt-bar-color:…;">
      <div class="njt-nofi-content njt-nofi-content-desktop">…text + button…</div>
      <div class="njt-nofi-content njt-nofi-content-mobile">…</div>  <!-- if mobileSeparate -->
      <button class="njt-nofi-close|njt-nofi-toggle">…</button>      <!-- per behavior -->
    </div>
  </div>
</div>
```

- Both desktop and mobile blocks are always emitted; CSS media query reveals one — JS never picks a device by width at render time.
- `content.text` uses safe innerHTML (server pre-sanitized via `wp_kses_post`); all other strings via `escapeAttr()` / `escapeText()` (`src/shared/escape-utils.js`, with `decodeBasicEntities()` fixing legacy v2 double-encoding).
- Colors exposed as CSS custom props (`--njt-bar-bg`, `--njt-bar-color`, `--njt-btn-bg`).
- Adding `.njt-nofi-visible` triggers the `njt-nofi-slide-in` keyframe; emits `njt_nofi_bar_rendered`.

## Phase 4 — Interaction (delegated listeners)

- Click `.njt-nofi-button-text` → open `button.url` (respect `newWindow`).
- Click `.njt-nofi-close` → `cookies.dismiss(id, reopenAfterDays)` (cookie `njt-notibar-{id}=1`, `SameSite=Lax`, `Max-Age = days*86400`; `days=0` = session) + remove from DOM.
- Toggle mode collapses content; collapse state persists in `sessionStorage`.

## Phase 5 — Rotation (`src/shared/rotation.js`, Pro)

```javascript
if (global.displayMode === 'rotation' && survivors.length > 1 && !prefersReducedMotion) {
  startRotation({ slot, bars: survivors, renderFn, global, intervalSec })
  // sequential (+1 mod n) or random (excludes current); pause on hover + Page Visibility
}
```

## Phase 6 — Body Push (`src/shared/body-push.js`)

`installBodyPush(slot)` uses a `ResizeObserver` on `.njt-nofi-container` to sync `body` padding (`padding-top` for top placement, `padding-bottom` for bottom), preventing layout overlap. Does not double-offset the admin bar (WP already bumps `html`).

## Phase 7 — Theme Compat (`src/frontend/theme-compat.js`)

`applyThemeCompat(themeName, slot)` dispatches by `wp_get_theme()->get('Name')` to one of 11 legacy positioning patches (Divi, Essentials, Nayma, Konte, Enfold, Uncode, Uptime Child, Themify Ultra, Salient, Radiate Child, AccessPress Parallax Pro Child) — ported 1:1 from v2.1.9. Helpers in `theme-compat/helpers.js` (`setStyles`, `barHeight`, `hasAdminBar`).

## Frontend Assets

- `assets/frontend/css/notibar.css` (~351 lines): z-index 10000, `njt-nofi-slide-in` keyframe, `data-position`/`data-placement` rules, desktop/mobile media queries, admin-bar `top:32px/46px` overrides, CSS custom props.
- `assets/frontend/js/tracking.js` (Pro, ~119 lines, static): see [tracking-and-i18n.md](./tracking-and-i18n.md).
