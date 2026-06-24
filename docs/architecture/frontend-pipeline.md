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

Before output, `maybeRender()` merges any 3rd-party injected bars into the native list via `BarRegistry::merge_external()` (native first, injected appended, id collisions resolved native-wins — see [bootstrap-and-data-model.md → Third-Party Bar Registry](./bootstrap-and-data-model.md#third-party-bar-registry-v320)). Asset enqueue is gated by `shouldRender()` — a lightweight server pre-filter (enabled, devices, schedule). WPML translations are applied via the `njt_nofi_resolve_strings` filter, and audience filtering (Pro) drops bars the current user can't see before output.

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

## Phase 5 — Rotation & Nav Arrows (`src/shared/rotation.js` + `nav-controls.js`, Pro)

```javascript
const arrowsOn   = global.rotationShowArrows !== false;
const isRotation = global.displayMode === 'rotation' && survivors.length > 1;
// Reduced-motion still starts the engine so manual arrows/keyboard work,
// just with autoplay off. If arrows are also off there's nothing interactive
// to show → fall through to a single render.
if (isRotation && (!prefersReducedMotion || arrowsOn)) {
  startRotation({ slot, bars: survivors, renderFn, global, autoplay: !prefersReducedMotion })
  // autoplay: sequential (+1 mod n) or random (excludes current); pause on hover + Page Visibility
}
```

**Manual nav arrows** (`nav-controls.js`, `@since 3.2.0`): `startRotation()` injects prev/next chevron buttons after each bar swap when `rotationShowArrows !== false && bars.length > 1`. Markup is layered on at runtime — `render-bar.js` is untouched and the server's initial paint never emits arrows. Clicks ride the slot's delegated listener (no per-button handlers, so re-injecting on every swap is leak-free); `ArrowLeft`/`ArrowRight` drive keyboard nav. Class names are intentionally neutral (`njt-nofi-nav`, `njt-nofi-nav-prev`/`-next`) so the Lite build's "zero rotation substrings" output invariant holds even though the file ships in Lite as inert.

## Phase 5b — Stack (`src/shared/stack.js`, Pro)

When `global.displayMode === 'stack'`, **all** survivors render at once instead of one (`buildStacksHTML(survivors, global, renderFn)`). Bars split by their own `style.placement` into a top `.njt-nofi-stack` wrapper and a bottom one; each wrapper carries `data-position` = `global.stackPositionType` (`fixed|absolute` — one position type for the whole stack, per-bar `positionType` ignored). `render-bar.js` is reused untouched per bar; CSS sets `.njt-nofi-stack .njt-nofi-container { position: static }` so bars fall into normal flow and stack one-per-row. A hairline separator divides adjacent bars; the bottom wrapper uses `flex-direction: column-reverse` so it grows from the viewport bottom upward (DOM order stays list order). Every `.njt-nofi-container-content` is revealed (each plays slide-in). Dismiss rebuilds the stack from the reduced survivors; collapse-toggle works per bar. Stack and rotation are mutually exclusive. `@since 3.2.0`; stripped from Lite (saved `stack` degrades to single render).

## Phase 6 — Body Push (`src/shared/body-push.js`)

`installBodyPush(slot)` uses `ResizeObserver` to sync `body` padding (`padding-top` for top, `padding-bottom` for bottom), preventing layout overlap. **Two-sided**: targets the lone `.njt-nofi-container` in single/rotation, or the `.njt-nofi-stack` wrapper(s) in stack mode — padding each side independently by its wrapper height, so a stack split across top + bottom reserves space on both. Re-attaches only when the target element set changes (inner stack changes re-sync via the wrapper's ResizeObserver). Does not double-offset the admin bar (WP already bumps `html`).

## Phase 7 — Theme Compat (`src/frontend/theme-compat.js`)

`applyThemeCompat(themeName, slot)` dispatches by `wp_get_theme()->get('Name')` to one of 11 legacy positioning patches (Divi, Essentials, Nayma, Konte, Enfold, Uncode, Uptime Child, Themify Ultra, Salient, Radiate Child, AccessPress Parallax Pro Child) — ported 1:1 from v2.1.9. Helpers in `theme-compat/helpers.js` (`setStyles`, `barHeight`, `hasAdminBar`).

**Stack-aware** (Pro): every shim offsets the theme's sticky header by `barHeight()` gated by `hasTopBar()`. Both helpers measure the top stack wrapper (`.njt-nofi-stack[data-placement='top']`) when present — so in stack mode the header clears the FULL top-stack height (sum of top bars), not just the first bar. Single/rotation (no stack wrapper) take the same code path as before.

**Essentials (pixfort) shim** (`essentials.js`, v3.1.4+): Avoids race condition with pixfort-core's per-scroll-tick inline `top` rewrites by owning a persistent `<style id="njt-nofi-essentials-compat">` element. Rule `.pix-header.is-scroll, .pix-header.pix-mobile-sticky { margin-top: <barHeight>px !important }` applies only while a visible top-placed bar exists; emptied otherwise. Margin-top composes additively into pixfort's sticky accumulator, no admin-bar offset needed (pixfort folds `#wpadminbar` into its own calc). Shim returns a `sync()` callback for dispatcher to re-run on bar slot mutations.

**Brandy (YayCommerce FSE) shim** (`brandy.js`, v3.1.5+): Brandy's sticky header (`.is-stickying .sticky-part`) is positioned purely by CSS using `top: var(--wp-adminbar-height)`. The shim injects `top: calc(var(--wp-adminbar-height, 0px) + <barHeight>px) !important` via the shared `makeBarOffsetStyleSync()` factory in `helpers.js` (also used by Essentials). Rule present only while a visible top-placed bar is active; the 0px fallback ensures the calc is valid when the admin-bar var is unset. Keeps admin-bar handling composable with the theme's own CSS.

## Frontend Assets

- `assets/frontend/css/notibar.css` (~516 lines): z-index 10000, `njt-nofi-slide-in` keyframe, `data-position`/`data-placement` rules, desktop/mobile media queries, admin-bar `top:32px/46px` overrides, CSS custom props, and `.njt-nofi-nav*` arrow-button styling (transparent ghost buttons, hover/focus states, 22px chevron icons).
- `assets/frontend/js/tracking.js` (Pro, ~119 lines, static): see [tracking-and-i18n.md](./tracking-and-i18n.md).
