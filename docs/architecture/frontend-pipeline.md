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

## Phase 1b — Dynamic Content Resolution (`includes/NotificationBar/DynamicContent.php::apply()`, Pro)

After WPML resolution and audience filtering, `DynamicContent::apply( $bars, $context )` resolves merge tags `{token}` and `{token|fallback}` in bar string fields. Resolution is server-side; the parser runs in both editions. Built-in token VALUES are Pro-gated (NJT_NOFI_IS_PRO); in Lite, all built-ins degrade to fallback/empty. Unknown/unregistered tokens pass through unchanged, so unrelated "{...}" text is never consumed.

**Fields processed**: `content.text`, `content.textMobile` (HTML fields → esc_html'd resolved values); `content.button.text`, `content.buttonMobile.text` (plain fields → raw values, escaped client-side at render). Per-field escaping avoids double-encoding and respects each field's rendering context.

**Built-ins** (Pro), provided by the `DynamicContentProviders` trait, grouped: visitor (`{user_first_name}`, `{user_last_name}`, `{user_display_name}`, `{user_role}`, `{visitor_country}` — per-visitor), date/time (`{current_date}`, `{current_time}`, `{current_day}`, `{current_month}`, `{current_year}`), site (`{site_name}`, `{site_tagline}`, `{users_count}`, `{posts_count}`), current post (`{post_title}`, `{post_author}`, `{post_category}`, `{post_date}`), WooCommerce (`{recently_viewed_product}`).

**Extensibility**: `apply_filters( 'njt_nofi_dynamic_tokens', $tokens, $ctx )` allows 3rd parties to register custom tokens via callback. Filter-added tokens work in any edition.

**Cache caveat**: Per-visitor tokens (all visitor/user tokens + `{visitor_country}` + `{recently_viewed_product}`) bake into page HTML → personalized pages must bypass full-page cache (same documented constraint as audience/country gates). Date/site/post tokens are cache-safe. `{users_count}` runs uncached `count_users()` (opt-in cost on large sites).

## Phase 1c — Countdown Epoch Resolution (`includes/NotificationBar/CountdownResolver.php::apply()`, Pro)

After DynamicContent resolution, `CountdownResolver::apply( $bars )` computes `countdown.endEpoch` (absolute milliseconds) for type='date' countdowns. PHP resolves each bar's `countdown.endAt` (datetime-local string, user-entered in site timezone) into milliseconds since epoch in `wp_timezone()` context, then inlines it as an integer. Type='evergreen' bars receive no `endEpoch` (client seeds the end timestamp into localStorage on first view).

**Resolution logic**: Uses `DateTimeImmutable` with site timezone; non-existent spring-forward times shift forward deterministically (PHP default). Computed field `countdown.endEpoch` is inlined per bar in boot JSON; not persisted to DB (resolution happens on the inlined copy only).

**Pro-gating**: Resolver runs only if `NJT_NOFI_IS_PRO` true; omitted entirely in Lite (field ungated in schema, but no value inlined — safe degradation).

## Phase 3 — Frontend Init (`src/frontend/index.js`)

```javascript
init()
  → read window.njtNotibarData
  → detectDevice(): window.innerWidth <= 480 ? 'mobile' : 'desktop'
  → filterBars(bars, { ...ctx, device, dismissed })   // src/shared/filter-bars.js
```

`filterBars()` applies, in order: `enabled` → device → CPT branch (Pro) → page/post logic (`all|none|include|exclude`) → dismissal (cookies) → schedule (date range, `daysOfWeek`, daily window incl. wrap-midnight, server-vs-client time).

## Phase 4 — Rendering (`src/shared/render-bar.js`)

`renderBarHTML(bar, global)` returns a string injected into `#njt-notibar-slot`. Markup contract:

```html
<div class="njt-nofi-container-content" role="status" aria-live="polite" data-bar-id="…">
  <div class="njt-nofi-container" data-position="fixed|absolute" data-placement="top|bottom">
    <div class="njt-nofi-notification-bar" style="--njt-bar-bg:…; --njt-bar-color:…;">
      <div class="njt-nofi-content njt-nofi-content-desktop">…text + button…</div>
      <div class="njt-nofi-content njt-nofi-content-mobile">…</div>  <!-- if mobileSeparate -->
      <!-- @pro countdown block -->
      <div class="njt-nofi-countdown njt-nofi-countdown--{ui}" data-cd-type="date|evergreen" data-cd-end="…" data-cd-duration="…" data-cd-units="…">
        <div class="njt-nofi-cd-unit" data-cd-unit="days|hours|minutes|seconds">
          <div class="njt-nofi-cd-num">--</div>
          <div class="njt-nofi-cd-label">Days</div>
        </div>
        <!-- …more units… -->
      </div>
      <!-- @endpro -->
      <button class="njt-nofi-close|njt-nofi-toggle">…</button>      <!-- per behavior -->
    </div>
  </div>
</div>
```

- Both desktop and mobile blocks are always emitted; CSS media query reveals one — JS never picks a device by width at render time.
- `content.text` uses safe innerHTML (server pre-sanitized via `wp_kses_post`); all other strings via `escapeAttr()` / `escapeText()` (`src/shared/escape-utils.js`, with `decodeBasicEntities()` fixing legacy v2 double-encoding).
- Colors exposed as CSS custom props (`--njt-bar-bg`, `--njt-bar-color`, `--njt-btn-bg`).
- **Countdown block** (@pro, `src/shared/render-bar.js::renderCountdown()`): emitted if `bar.countdown.enabled && NJT_NOFI_IS_PRO`. Pre-painted with `--` digits; circular UI includes SVG ring per unit driven by `--cd-progress` CSS var. One countdown per bar, positioned between text and button.
- Adding `.njt-nofi-visible` triggers the `njt-nofi-slide-in` keyframe; emits `njt_nofi_bar_rendered`.

## Phase 5 — Interaction (delegated listeners)

- Click `.njt-nofi-button-text` → open `button.url` (respect `newWindow`).
- Click `.njt-nofi-close` → `cookies.dismiss(id, reopenAfterDays)` (cookie `njt-notibar-{id}=1`, `SameSite=Lax`, `Max-Age = days*86400`; `days=0` = session) + remove from DOM.
- Toggle mode collapses content; collapse state persists in `sessionStorage`.

## Phase 5b — Countdown Ticker (`src/shared/countdown.js`, Pro)

Single slot-level `setInterval(1000)` hydrates + updates all `.njt-nofi-countdown` elements. Survives rotation/dismiss/collapse re-renders via cleanup-free listener registration in `src/frontend/index.js`.

**Type=date logic**: Reads `data-cd-end` (epoch ms); computes remainder every second; updates `.njt-nofi-cd-num` text and `--cd-progress` CSS var per unit (0.0 ≤ progress ≤ 1.0). At zero, adds `.is-expired` class to countdown element (hides via CSS); bar remains visible.

**Type=evergreen logic**: On first render, checks localStorage (`njt-notibar-<barId>-cd-end`); if absent, seeds it to `now + duration (ms)`. Computes remainder from stored end-time every tick; same update logic as type=date. Clears seed on manual dismiss. Degrades gracefully if localStorage unavailable (try/catch).

**Animations**: Flip and circular UIs trigger CSS transitions; both degrade to static under `prefers-reduced-motion` (JS disables animation events; digits still update).

**Lite**: Module stripped from bundle via `pro-manifest.json` "remove" entry. UI disabled in Customizer. No countdown markup renders even with imported Pro config.

## Phase 7 — Rotation & Nav Arrows (`src/shared/rotation.js` + `nav-controls.js`, Pro)

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

## Phase 7b — Stack (`src/shared/stack.js`, Pro)

When `global.displayMode === 'stack'`, **all** survivors render at once instead of one (`buildStacksHTML(survivors, global, renderFn)`). Bars split by their own `style.placement` into a top `.njt-nofi-stack` wrapper and a bottom one; each wrapper carries `data-position` = `global.stackPositionType` (`fixed|absolute` — one position type for the whole stack, per-bar `positionType` ignored). `render-bar.js` is reused untouched per bar; CSS sets `.njt-nofi-stack .njt-nofi-container { position: static }` so bars fall into normal flow and stack one-per-row. A hairline separator divides adjacent bars; the bottom wrapper uses `flex-direction: column-reverse` so it grows from the viewport bottom upward (DOM order stays list order). Every `.njt-nofi-container-content` is revealed (each plays slide-in). Dismiss rebuilds the stack from the reduced survivors; collapse-toggle works per bar. Stack and rotation are mutually exclusive. `@since 3.2.0`; stripped from Lite (saved `stack` degrades to single render).

## Phase 8 — Body Push (`src/shared/body-push.js`)

`installBodyPush(slot)` uses `ResizeObserver` to sync `body` padding (`padding-top` for top, `padding-bottom` for bottom), preventing layout overlap. **Two-sided**: targets the lone `.njt-nofi-container` in single/rotation, or the `.njt-nofi-stack` wrapper(s) in stack mode — padding each side independently by its wrapper height, so a stack split across top + bottom reserves space on both. Re-attaches only when the target element set changes (inner stack changes re-sync via the wrapper's ResizeObserver). Does not double-offset the admin bar (WP already bumps `html`).

## Phase 9 — Theme Compat (`src/frontend/theme-compat.js`)

`applyThemeCompat(themeName, slot)` dispatches by `wp_get_theme()->get('Name')` to one of 11 legacy positioning patches (Divi, Essentials, Nayma, Konte, Enfold, Uncode, Uptime Child, Themify Ultra, Salient, Radiate Child, AccessPress Parallax Pro Child) — ported 1:1 from v2.1.9. Helpers in `theme-compat/helpers.js` (`setStyles`, `barHeight`, `hasAdminBar`).

**Stack-aware** (Pro): every shim offsets the theme's sticky header by `barHeight()` gated by `hasTopBar()`. Both helpers measure the top stack wrapper (`.njt-nofi-stack[data-placement='top']`) when present — so in stack mode the header clears the FULL top-stack height (sum of top bars), not just the first bar. Single/rotation (no stack wrapper) take the same code path as before.

**Essentials (pixfort) shim** (`essentials.js`, v3.1.4+): Avoids race condition with pixfort-core's per-scroll-tick inline `top` rewrites by owning a persistent `<style id="njt-nofi-essentials-compat">` element. Rule `.pix-header.is-scroll, .pix-header.pix-mobile-sticky { margin-top: <barHeight>px !important }` applies only while a visible top-placed bar exists; emptied otherwise. Margin-top composes additively into pixfort's sticky accumulator, no admin-bar offset needed (pixfort folds `#wpadminbar` into its own calc). Shim returns a `sync()` callback for dispatcher to re-run on bar slot mutations.

**Brandy (YayCommerce FSE) shim** (`brandy.js`, v3.1.5+): Brandy's sticky header (`.is-stickying .sticky-part`) is positioned purely by CSS using `top: var(--wp-adminbar-height)`. The shim injects `top: calc(var(--wp-adminbar-height, 0px) + <barHeight>px) !important` via the shared `makeBarOffsetStyleSync()` factory in `helpers.js` (also used by Essentials). Rule present only while a visible top-placed bar is active; the 0px fallback ensures the calc is valid when the admin-bar var is unset. Keeps admin-bar handling composable with the theme's own CSS.

## Frontend Assets

- `assets/frontend/css/notibar.css` (~516 lines): z-index 10000, `njt-nofi-slide-in` keyframe, `data-position`/`data-placement` rules, desktop/mobile media queries, admin-bar `top:32px/46px` overrides, CSS custom props, and `.njt-nofi-nav*` arrow-button styling (transparent ghost buttons, hover/focus states, 22px chevron icons).
- `assets/frontend/js/tracking.js` (Pro, ~119 lines, static): see [tracking-and-i18n.md](./tracking-and-i18n.md).
