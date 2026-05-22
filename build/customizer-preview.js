/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/shared/body-push.js"
/*!*********************************!*\
  !*** ./src/shared/body-push.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   installBodyPush: () => (/* binding */ installBodyPush)
/* harmony export */ });
/**
 * Body-push utility — keep the page body padded so a top-positioned Notibar
 * does not collapse on top of the site header.
 *
 * Replaces v2's manual padding logic with a ResizeObserver + MutationObserver
 * combo so dynamic height changes (rotation, collapse-toggle, responsive
 * breakpoints) re-sync automatically.
 *
 * Applies for data-position in { 'fixed', 'absolute' }. Both floats above the
 * normal flow; both need the body push so the initial layout has room for the
 * bar. For 'absolute' the bar scrolls away naturally with the document; for
 * 'fixed' it remains pinned to the viewport top.
 *
 * Admin-bar coexistence: WordPress already injects `html { margin-top: 32px
 * !important }` (or 46px on narrow viewports) via _admin_bar_bump_cb() to
 * offset for the admin bar. That html margin pushes the body element down
 * already — so we MUST NOT add another adminBarOffset to body padding, or
 * we'd double-count and visitors would see a gap below the bar equal to
 * the admin bar height. Body padding here is purely bar-height.
 *
 * For the fixed/absolute Notibar itself: its CSS `top:0` is overridden to
 * `top: 32px` (or 46px) by `.admin-bar .njt-nofi-container[...]` rules in
 * notibar.css so the bar sits BELOW the admin bar, not behind it.
 *
 * @since 3.0.0
 */

const PUSH_POSITIONS = new Set(['fixed', 'absolute']);
function setBodyPad(px) {
  if (px > 0) {
    document.body.style.setProperty('padding-top', px + 'px', 'important');
  } else {
    document.body.style.removeProperty('padding-top');
  }
}

/**
 * Install body-push on a Notibar slot element.
 *
 * Returns an uninstall function that detaches all observers and clears
 * the body padding.
 *
 * @param {HTMLElement} slot The #njt-notibar-slot element (frontend) or
 *                           preview equivalent.
 * @return {Function} uninstall handler.
 */
function installBodyPush(slot) {
  if (!slot || typeof ResizeObserver === 'undefined') {
    return function noop() {};
  }
  let currentBar = null;
  let sizeObserver = null;
  function sync() {
    if (!currentBar) {
      setBodyPad(0);
      return;
    }
    // Bar height only — WP's html margin-top handles the admin-bar offset.
    setBodyPad(currentBar.offsetHeight);
  }
  function attach(bar) {
    if (sizeObserver) {
      sizeObserver.disconnect();
      sizeObserver = null;
    }
    currentBar = bar;
    if (!bar) {
      setBodyPad(0);
      return;
    }
    const pos = bar.getAttribute('data-position') || 'fixed';
    if (!PUSH_POSITIONS.has(pos)) {
      setBodyPad(0);
      return;
    }
    sizeObserver = new ResizeObserver(sync);
    sizeObserver.observe(bar);
    sync();
  }
  function findBar() {
    return slot.querySelector('.njt-nofi-container');
  }
  attach(findBar());

  // Re-attach when the slot's children change (rotation swaps the bar element,
  // dismiss removes it, Customizer preview live-replaces it on every keystroke).
  const slotObserver = new MutationObserver(function () {
    const bar = findBar();
    if (bar !== currentBar) {
      attach(bar);
    }
  });
  slotObserver.observe(slot, {
    childList: true,
    subtree: true
  });

  // Admin-bar offset depends on viewport width (32 vs 46px boundary at 783px).
  function onResize() {
    sync();
  }
  window.addEventListener('resize', onResize);
  return function uninstall() {
    if (sizeObserver) {
      sizeObserver.disconnect();
    }
    slotObserver.disconnect();
    window.removeEventListener('resize', onResize);
    setBodyPad(0);
  };
}

/***/ },

/***/ "./src/shared/escape-utils.js"
/*!************************************!*\
  !*** ./src/shared/escape-utils.js ***!
  \************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   decodeBasicEntities: () => (/* binding */ decodeBasicEntities),
/* harmony export */   escapeAttr: () => (/* binding */ escapeAttr),
/* harmony export */   escapeText: () => (/* binding */ escapeText)
/* harmony export */ });
/**
 * Escape utilities for safe HTML generation.
 *
 * Used by render-bar.js to prevent XSS when building markup from bar data.
 * NOTE: bar.content.text / bar.content.textMobile are pre-sanitized via
 * wp_kses_post on the server-side save — they are SAFE for innerHTML.
 * All other user-controlled strings (button text/url, colors, etc.) MUST
 * go through escapeAttr() or escapeText() before being placed in markup.
 *
 * @since 3.0.0
 */

const ESCAPE_ATTR_MAP = {
  '&': '&amp;',
  '"': '&quot;',
  "'": '&#x27;',
  '<': '&lt;',
  '>': '&gt;'
};

/**
 * Escape a string for safe use inside an HTML attribute value.
 * Covers &, ", ', <, >.
 *
 * @param {*} value Value to escape (coerced to string).
 *
 * @return {string} Escaped string.
 */
function escapeAttr(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[&"'<>]/g, ch => ESCAPE_ATTR_MAP[ch]);
}

/**
 * Escape a string for safe use as HTML text content.
 * Encodes &, <, > — sufficient for element text nodes.
 *
 * @param {*} value Value to escape (coerced to string).
 *
 * @return {string} Escaped string.
 */
function escapeText(value) {
  return String(value === null || value === undefined ? '' : value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
const DECODE_ENTITIES_MAP = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'"
};

/**
 * Decode the basic HTML entities our render layer would re-encode.
 *
 * Why: legacy v2.x button text was stored via wp_filter_nohtml_kses, which
 * entity-encodes "&" → "&amp;". When render-bar.js then runs escapeText()
 * on that stored value, "&amp;" becomes "&amp;amp;" and the visitor sees
 * literal "&amp;" instead of "&". Decoding first, then re-escaping at the
 * render layer, yields the correct character regardless of whether the
 * stored value was raw or pre-encoded. Plain text fields only — never
 * call on bar.content.text (which legitimately holds HTML markup).
 *
 * @param {*} value Value to decode (coerced to string).
 *
 * @return {string} String with basic entities decoded.
 */
function decodeBasicEntities(value) {
  return String(value === null || value === undefined ? '' : value).replace(/&(?:amp|lt|gt|quot|#39|#x27);/gi, m => DECODE_ENTITIES_MAP[m.toLowerCase()] || m);
}

/***/ },

/***/ "./src/shared/filter-bars.js"
/*!***********************************!*\
  !*** ./src/shared/filter-bars.js ***!
  \***********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   filterBars: () => (/* binding */ filterBars)
/* harmony export */ });
/**
 * Notibar shared bar-filter module.
 *
 * Pure function: (bars[], ctx) → Bar[]
 * No side-effects, no DOM reads, no global state.
 *
 * Mirrors PHP-side NotificationBarHandle::njt_nofi_isDisplayNotification logic.
 * Phase 07 frontend runtime imports this same module for consistent behaviour.
 *
 * Context shape:
 *   {
 *     pageId:          number,   // current WP page ID (0 if not a page)
 *     postId:          number,   // current WP post ID (0 if not a single post)
 *     isHome:          boolean,  // true when is_home() || is_front_page()
 *     isSingleProduct: boolean,  // true on single WC product
 *     device:          'desktop' | 'mobile',
 *     dismissed:       string[], // bar IDs the visitor already dismissed (cookie-sourced)
 *     isPreview:       boolean,  // true inside Customizer preview iframe
 *     currentCptType:  string,   // CPT slug on single CPT (excl. page/post);
 *                                // '' on page/post/archive/home/non-singular.
 *     currentObjectId: number,   // get_queried_object_id() — populated on any
 *                                // singular; CPT branch is the only consumer.
 *   }
 *
 * @since 3.0.0
 */

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Test whether the given logic rule passes for a given ID list + context.
 *
 * IDs in the schema are numeric (after JSON.parse) plus the literal string
 * "home_page". `ids.includes(currentId)` would fail when types differ, so we
 * normalise both sides to strings before comparing.
 *
 * @param {string}               logic           'all' | 'none' | 'include' | 'exclude'
 * @param {Array<number|string>} ids             Configured ID list (may contain 'home_page').
 * @param {number}               currentId       Numeric ID to test against (0 = not applicable).
 * @param {boolean}              isHome          Whether the current page is the home/front page.
 * @param {boolean}              isSingleProduct Whether the current page is a single WooCommerce product.
 *
 * @return {boolean} true = bar should render for this context.
 */
function passesLogic(logic, ids, currentId, isHome, isSingleProduct) {
  const target = String(currentId);
  const inList = currentId > 0 && ids.some(id => String(id) === target) || isHome && ids.includes('home_page') || isSingleProduct && ids.includes('wc_single_product');
  switch (logic) {
    case 'all':
      return true;
    case 'none':
      return false;
    case 'include':
      return inList;
    case 'exclude':
      return !inList;
    default:
      return true;
  }
}

/**
 * Test whether the current local time falls inside the given daily window.
 * Empty bounds = unbounded on that side. Supports wrap-around (e.g. 22:00–02:00).
 *
 * @param {string} now   "HH:MM" current site-local time.
 * @param {string} start "HH:MM" or empty.
 * @param {string} end   "HH:MM" or empty.
 * @return {boolean} true = inside window.
 */
function inDailyWindow(now, start, end) {
  if ('' === start && '' === end) {
    return true;
  }
  if ('' === start) {
    return now < end;
  }
  if ('' === end) {
    return now >= start;
  }
  // Lex compare works because HH:MM is zero-padded.
  if (start <= end) {
    return now >= start && now < end;
  }
  // Wrapped window (e.g. 22:00–02:00).
  return now >= start || now < end;
}

/**
 * Schedule filter — date range + day-of-week + daily window.
 *
 * Mirrors NotificationBarHandle::passesSchedule (PHP).
 * Inert when bar.schedule.enabled is false.
 *
 * Per-bar time source:
 *  - schedule.useClientTime === true → visitor browser-local time
 *    (Date.now() / new Date()), ignoring server-emitted ctx fields.
 *  - otherwise → prefer ctx.serverNow/serverWeekday/serverHHMM (so cached
 *    pages agree with what PHP filtered); fall back to client clock when
 *    absent (e.g. Customizer preview iframe).
 *
 * @param {Object} bar Bar object.
 * @param {Object} ctx Context (provides serverNow/serverWeekday/serverHHMM
 *                     if emitted by PHP; otherwise falls back to Date.now()).
 * @return {boolean} true = passes (bar may render).
 */
function passesSchedule(bar, ctx) {
  const sched = bar.schedule;
  if (!sched || !sched.enabled) {
    return true;
  }

  // Strict === true so missing/falsy/string values fall through to the
  // existing server-time branch (regression-safe for bars saved before
  // the toggle existed).
  const useClient = sched.useClientTime === true;
  let nowMs;
  let weekday;
  let hhmmNow;
  if (useClient) {
    const now = new Date();
    nowMs = now.getTime();
    weekday = now.getDay();
    hhmmNow = formatHHMM(now);
  } else {
    nowMs = typeof ctx.serverNow === 'number' ? ctx.serverNow * 1000 : Date.now();
    const nowDate = new Date(nowMs);
    weekday = typeof ctx.serverWeekday === 'number' ? ctx.serverWeekday : nowDate.getDay();
    hhmmNow = typeof ctx.serverHHMM === 'string' ? ctx.serverHHMM : formatHHMM(nowDate);
  }

  // Date range — datetime-local strings; treated as site-local.
  if (sched.startAt) {
    const startMs = parseDateTimeLocal(sched.startAt);
    if (!isNaN(startMs) && startMs > nowMs) {
      return false;
    }
  }
  if (sched.endAt) {
    const endMs = parseDateTimeLocal(sched.endAt);
    if (!isNaN(endMs) && endMs <= nowMs) {
      return false;
    }
  }

  // Day-of-week — empty array = all days (matches PHP behaviour).
  const dow = Array.isArray(sched.daysOfWeek) ? sched.daysOfWeek : [];
  if (dow.length > 0 && !dow.includes(weekday)) {
    return false;
  }

  // Daily window.
  const dw = sched.dailyWindow || {};
  if (dw.enabled && (dw.start || dw.end)) {
    if (!inDailyWindow(hhmmNow, dw.start || '', dw.end || '')) {
      return false;
    }
  }
  return true;
}

// Parses "YYYY-MM-DDTHH:MM" (datetime-local) as a local-time timestamp.
// Browsers without a TZ suffix already treat this as local — we just
// guard against bad input.
function parseDateTimeLocal(s) {
  if (typeof s !== 'string' || !s) {
    return NaN;
  }
  // Append :00 seconds so Date parses consistently across browsers.
  const normalised = s.length === 16 ? s + ':00' : s;
  return new Date(normalised).getTime();
}
function formatHHMM(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return h + ':' + m;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Filter bars to those that should render in the given context.
 *
 * Preview iframe behaviour (ctx.isPreview === true):
 *  - Device gating is skipped (admin wants to see all bars regardless of
 *    the previewed device width so they can edit them).
 *  - Dismissal cookie check is skipped (no persistence in preview).
 *  - Page/post logic still applies so display-condition settings are testable.
 *
 * @param {Object[]} bars Array of bar objects (Schema::defaultBar() shape).
 * @param {Object}   ctx  Context object — see module docblock for shape.
 *
 * @return {Object[]} Ordered subset of bars that should render.
 */
function filterBars(bars, ctx) {
  if (!Array.isArray(bars)) {
    return [];
  }
  const {
    pageId = 0,
    postId = 0,
    isHome = false,
    isSingleProduct = false,
    device = 'desktop',
    dismissed = [],
    isPreview = false,
    currentCptType = '',
    currentObjectId = 0
  } = ctx;
  return bars.filter(bar => {
    // Must be enabled.
    if (bar.enabled !== true) {
      return false;
    }
    const display = bar.display || {};

    // Device gate — skipped in preview so admin can see all bars.
    if (!isPreview) {
      const allowedDevices = display.devices || [];
      if (!allowedDevices.includes(device)) {
        return false;
      }
    }

    // CPT branch ("Other post types") — owns single CPT instances
    // exclusively. When the visitor is on a single CPT page AND admin
    // opted that CPT into `cptTypes`, this branch evaluates cptLogic and
    // SKIPS pageLogic + postLogic entirely. Legacy bars (cptTypes=[]) and
    // non-CPT contexts (page/post/archive/home) fall through to the
    // existing else branch with byte-identical behavior.
    const cptTypes = Array.isArray(display.cptTypes) ? display.cptTypes : [];
    const cptClaimed = '' !== currentCptType && cptTypes.includes(currentCptType);
    if (cptClaimed) {
      const cptLogic = display.cptLogic || 'all';
      const cptIds = display.cptIds || [];
      if (!passesLogic(cptLogic, cptIds, currentObjectId, false, false)) {
        return false;
      }
    } else {
      // Page logic
      // `pageLogic` governs every NON-single-post context: pages, home,
      // archives (categories, tags, author, date), WC product, search, 404.
      // `postLogic` (below) governs single posts only — the two are
      // mutually exclusive by context.
      //
      // `none` (hide on all pages) must fire across all those non-single-post
      // contexts unconditionally — including archives where the
      // `pageId > 0 || isHome || isSingleProduct` gate would otherwise skip
      // it. The `postId === 0` guard ensures it does NOT clobber a single
      // post; that context belongs to postLogic.
      const pageLogic = display.pageLogic || 'all';
      if ('none' === pageLogic && postId === 0) {
        return false;
      }
      if (pageId > 0 || isHome || isSingleProduct) {
        if (!passesLogic(pageLogic, display.pageIds || [], pageId, isHome, isSingleProduct)) {
          return false;
        }
      }

      // Post logic — only applies to single-post contexts. Unlike pageLogic
      // (which is the catch-all for non-post contexts including archives),
      // postLogic='none' means "hide on all single POSTS" — it should NOT
      // fire on pages, the shop, archives, etc. So the postId>0 gate
      // stays around the whole block.
      if (postId > 0) {
        if (!passesLogic(display.postLogic || 'all', display.postIds || [], postId, false, false)) {
          return false;
        }
      }
    }

    // Dismissal — skipped in preview. Both sides coerced to string
    // because dismissed[] is populated from cookies (strings) while
    // bar.id is the JSON-decoded UUID (may be string already, but
    // be defensive — same coercion lesson as passesLogic above).
    if (!isPreview) {
      const barIdStr = String(bar.id);
      if (dismissed.some(id => String(id) === barIdStr)) {
        return false;
      }
    }

    // Schedule — skipped in preview iframe (admin must always see the
    // bar being edited regardless of its schedule window).
    if (!isPreview && !passesSchedule(bar, ctx)) {
      return false;
    }
    return true;
  });
}

/***/ },

/***/ "./src/shared/preview-styles.js"
/*!**************************************!*\
  !*** ./src/shared/preview-styles.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PREVIEW_STYLES: () => (/* binding */ PREVIEW_STYLES)
/* harmony export */ });
/**
 * Notibar preview inline styles.
 *
 * Holds preview-only CSS that must never leak to the live frontend (e.g. the
 * in-bar Edit affordance that lets admins jump straight into the bar editor
 * from the Customizer preview). Injected via injectPreviewStyles() in
 * customizer-preview/index.js — frontend.js does NOT load this string.
 *
 * Anything that should look identical on preview AND live belongs in
 * assets/frontend/css/notibar.css instead (enqueued by both contexts).
 *
 * @since 3.0.0
 */

const PREVIEW_STYLES = `
.njt-nofi-edit-btn {
  position: absolute;
  top: 6px;
  left: 6px;
  z-index: 10001;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font: 12px/1 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1d2327;
  background: rgba(255,255,255,0.92);
  border: 1px solid #c3c4c7;
  border-radius: 3px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.12);
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.njt-nofi-edit-btn:hover {
  background: #fff;
  border-color: #2271b1;
  color: #2271b1;
}
.njt-nofi-edit-btn:focus-visible {
  outline: 2px solid #2271b1;
  outline-offset: 1px;
}
.njt-nofi-edit-btn svg {
  width: 12px;
  height: 12px;
  fill: currentColor;
}
`;

/***/ },

/***/ "./src/shared/render-bar.js"
/*!**********************************!*\
  !*** ./src/shared/render-bar.js ***!
  \**********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderBarHTML: () => (/* binding */ renderBarHTML)
/* harmony export */ });
/* harmony import */ var _escape_utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./escape-utils.js */ "./src/shared/escape-utils.js");
/**
 * Notibar shared render module.
 *
 * Pure function: bar + global config → HTML string.
 * No DOM mutations, no global reads, no side-effects.
 *
 * MARKUP CONTRACT: The structure produced here is the authoritative v3 markup.
 * Phase 07 frontend JS and PHP SSR MUST emit identical class names, data
 * attributes, and CSS custom properties. Do not change structure without
 * updating phase 07 simultaneously.
 *
 * Escape policy:
 *  - bar.content.text / bar.content.textMobile → safe innerHTML (wp_kses_post on server).
 *  - Everything else (button text, URL, color values, IDs…) → escapeAttr / escapeText.
 *
 * @since 3.0.0
 */



// Alignment value → CSS justify-content mapping (flex child positioning).
const ALIGNMENT_MAP = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
  'space-around': 'space-around'
};

// Parallel mapping for text-align — applied so multi-line text inside
// .njt-nofi-text follows the bar's alignment setting (not just the
// horizontal position of the text+button row).
const TEXT_ALIGN_MAP = {
  center: 'center',
  left: 'left',
  right: 'right',
  'space-around': 'center'
};

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Render a CTA button anchor element.
 *
 * @param {Object} button Button config from bar.content.
 * @param {Object} style  Bar style config (for btnBgColor, btnTextColor, fontWeight).
 * @param {string} kind   'desktop' | 'mobile' — affects aria-label suffix.
 *
 * @return {string} HTML string or empty string when button disabled.
 */
function renderButton(button, style, kind) {
  if (!button || !button.enabled) {
    return '';
  }

  // Decode any pre-existing HTML entities in the stored text before the
  // render layer re-escapes them. Defensive against legacy v2.x data
  // migrated via wp_filter_nohtml_kses, which stored "&" as "&amp;".
  const text = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.decodeBasicEntities)(button.text || 'Learn more');
  const url = button.url || '#';
  const newWindow = button.newWindow ? ' target="_blank" rel="noopener noreferrer"' : '';
  const ariaLabel = text.trim() ? (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(text) : `Learn more about this notification (${kind})`;
  const btnStyle = [`background:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(style.btnBgColor || '#1919cf')}`, `color:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(style.btnTextColor || '#ffffff')}`, `font-weight:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(button.fontWeight || 400)}`, 'border-radius:3px'].join(';');
  return `<div class="njt-nofi-button">` + `<a href="${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(url)}"${newWindow} ` + `class="njt-nofi-button-text" ` + `aria-label="${ariaLabel}" ` + `style="${btnStyle}">` + (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeText)(text) + `</a></div>`;
}

/**
 * Render the dismissal / toggle control.
 * hideCloseButton: 'close' | 'toggle' | 'disable'
 *
 * @param {string} mode hideCloseButton enum value.
 *
 * @return {string} HTML string or empty string for 'disable'.
 */
function renderCloseControl(mode) {
  // SVG × path used for both close and toggle icons.
  const svgPath = 'm386.667 45.564-45.564-45.564-147.77 147.769-147.769-147.769' + '-45.564 45.564 147.769 147.769-147.769 147.77 45.564 45.564' + ' 147.769-147.769 147.769 147.769 45.564-45.564-147.768-147.77z';
  const svgIcon = `<svg class="njt-nofi-close-icon" xmlns="http://www.w3.org/2000/svg" ` + `viewBox="0 0 386.667 386.667" width="14" height="14" aria-hidden="true">` + `<path d="${svgPath}" fill="currentColor"/></svg>`;
  if (mode === 'close') {
    return `<button class="njt-nofi-close" type="button" aria-label="Close">` + svgIcon + `</button>`;
  }
  if (mode === 'toggle') {
    return `<button class="njt-nofi-toggle" type="button" aria-label="Collapse/expand">` + svgIcon + `</button>`;
  }

  // 'disable' — no control rendered.
  return '';
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Render a notification bar to an HTML string.
 *
 * Resilient mobile rendering (resolved decision #3): both desktop AND mobile
 * content blocks are always emitted. CSS media query reveals one at runtime.
 * JS never makes a device choice based on window.innerWidth.
 *
 * The `global` parameter is accepted for API consistency with phase 07 usage
 * (e.g. rotation caller passes global through). Currently unused here since
 * bar-level style is self-contained, but retained for forward compatibility.
 *
 * @param {Object} bar    Bar object conforming to Schema::defaultBar() shape.
 * @param {Object} global Global config conforming to Schema::defaultGlobal() shape.
 *
 * @return {string} Complete bar HTML string.
 */
// eslint-disable-next-line no-unused-vars -- global is part of the API contract (phase 07 callers pass it through rotation)
function renderBarHTML(bar, global) {
  const style = bar.style || {};
  const content = bar.content || {};
  const behavior = bar.behavior || {};
  const bgColor = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(style.bgColor || '#9af4cf');
  const textColor = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(style.textColor || '#1919cf');
  const fontSize = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(Number(style.fontSize) || 15);
  const contentWidth = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(Number(style.contentWidth) || 900);
  const positionType = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(style.positionType || 'fixed');
  const alignment = ALIGNMENT_MAP[style.alignment] || 'center';
  const textAlign = TEXT_ALIGN_MAP[style.alignment] || 'center';
  const barId = (0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(bar.id || '');

  // Desktop content block — always emitted.
  const desktopBlock = `<div class="njt-nofi-content njt-nofi-content-desktop" ` + `style="max-width:${contentWidth}px;justify-content:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(alignment)};text-align:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(textAlign)};font-size:${fontSize}px;">` + `<div class="njt-nofi-text">${content.text || ''}</div>` + renderButton(content.button, style, 'desktop') + `</div>`;

  // Mobile content block — only emitted when mobileSeparate is true.
  // When false, CSS media query simply continues showing the desktop block.
  // Text and button are both device-specific in this branch; falls back to
  // the desktop button only if buttonMobile is somehow missing (defensive —
  // Schema::defaultContent populates both by default).
  const mobileBlock = content.mobileSeparate ? `<div class="njt-nofi-content njt-nofi-content-mobile" ` + `style="justify-content:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(alignment)};text-align:${(0,_escape_utils_js__WEBPACK_IMPORTED_MODULE_0__.escapeAttr)(textAlign)};font-size:${fontSize}px;">` + `<div class="njt-nofi-text">${content.textMobile || ''}</div>` + renderButton(content.buttonMobile || content.button, style, 'mobile') + `</div>` : '';
  const closeControl = renderCloseControl(behavior.hideCloseButton || 'close');

  // Marker class — present only when a mobile block was emitted. CSS uses
  // this to decide whether to hide the desktop block on mobile; without it,
  // the desktop block must stay visible (otherwise the bar is blank when
  // content.mobileSeparate is false).
  const barClass = 'njt-nofi-notification-bar' + (content.mobileSeparate ? ' njt-nofi-has-mobile' : '');
  return `<div class="njt-nofi-container-content" role="status" aria-live="polite" data-bar-id="${barId}">` + `<div class="njt-nofi-container" data-position="${positionType}">` + `<div class="${barClass}" ` + `style="--njt-bar-bg:${bgColor};--njt-bar-color:${textColor};">` + desktopBlock + mobileBlock + closeControl + `</div>` + `</div>` + `</div>`;
}

/***/ },

/***/ "./src/shared/rotation.js"
/*!********************************!*\
  !*** ./src/shared/rotation.js ***!
  \********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   nextIndex: () => (/* binding */ nextIndex),
/* harmony export */   startRotation: () => (/* binding */ startRotation)
/* harmony export */ });
/* eslint-env browser */
/**
 * Notibar shared rotation module.
 *
 * Drives multi-bar rotation in both the Customizer preview and the
 * frontend runtime (phase 07). Returns a cleanup handle so callers
 * can stop the rotation before starting a new one (no interval leaks).
 *
 * Features:
 *  - configurable interval (rotationIntervalSeconds)
 *  - pause-on-hover via mouseenter / mouseleave on the slot element
 *  - pause when tab is hidden via Page Visibility API
 *
 * @since 3.0.0
 */

// eslint-disable-next-line jsdoc/check-line-alignment
/**
 * Start a rotation cycle on the given slot element.
 *
 * @param {Object}      options               Options bag.
 * @param {HTMLElement} options.slot          Container element to swap innerHTML on.
 * @param {Object[]}    options.bars          Pre-filtered array of bar objects (min 2).
 * @param {Function}    options.renderFn      renderBarHTML(bar, global) function.
 * @param {Object}      options.global        Global config object.
 * @param {number}      [options.intervalSec] Override rotationIntervalSeconds.
 *
 * @return {{ stop: Function }} Cleanup handle. Call stop() before re-rendering.
 */
/**
 * Compute the next bar index based on rotation order setting.
 *
 * - 'sequential' (default): cyclic +1.
 * - 'random': uniform random over indices excluding the current one
 *   (so the bar always visibly changes on every tick).
 *
 * @param {number} current Current bar index.
 * @param {number} count   Total bars (≥1).
 * @param {string} [order] 'sequential' (default) or 'random'.
 * @return {number} Next index.
 */
function nextIndex(current, count, order) {
  if (count <= 1) {
    return 0;
  }
  if ('random' === order) {
    // Pick uniformly from [0..count-1] excluding `current`.
    const r = Math.floor(Math.random() * (count - 1));
    return r >= current ? r + 1 : r;
  }
  return (current + 1) % count;
}
function startRotation({
  slot,
  bars,
  renderFn,
  global,
  intervalSec
}) {
  let index = 0;
  let paused = false;
  let timerId = null;
  const delay = (intervalSec || global.rotationIntervalSeconds || 5) * 1000;
  const pauseOnHover = global.rotationPauseOnHover !== false;
  function revealNewBar() {
    const containerContent = slot.querySelector('.njt-nofi-container-content');
    if (!containerContent) {
      return;
    }
    // Adding the class triggers the @keyframes slide-in animation in
    // notibar.css. Keyframes play unconditionally — no reflow trick
    // needed (unlike CSS transitions which require detected change).
    containerContent.classList.add('njt-nofi-visible');
  }
  function advance() {
    if (paused) {
      return;
    }
    index = nextIndex(index, bars.length, global.rotationOrder);
    slot.innerHTML = renderFn(bars[index], global);
    revealNewBar();
  }
  function pause() {
    paused = true;
  }
  function resume() {
    paused = false;
  }
  function onVisibilityChange() {
    if (document.hidden) {
      pause();
    } else {
      resume();
    }
  }

  // Render first bar immediately (caller may have already done this).
  slot.innerHTML = renderFn(bars[0], global);
  revealNewBar();
  timerId = setInterval(advance, delay);
  if (pauseOnHover) {
    slot.addEventListener('mouseenter', pause);
    slot.addEventListener('mouseleave', resume);
  }
  document.addEventListener('visibilitychange', onVisibilityChange);
  return {
    stop() {
      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      if (pauseOnHover) {
        slot.removeEventListener('mouseenter', pause);
        slot.removeEventListener('mouseleave', resume);
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  };
}

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*****************************************!*\
  !*** ./src/customizer-preview/index.js ***!
  \*****************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shared_render_bar_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/render-bar.js */ "./src/shared/render-bar.js");
/* harmony import */ var _shared_filter_bars_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/filter-bars.js */ "./src/shared/filter-bars.js");
/* harmony import */ var _shared_rotation_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/rotation.js */ "./src/shared/rotation.js");
/* harmony import */ var _shared_body_push_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/body-push.js */ "./src/shared/body-push.js");
/* harmony import */ var _shared_preview_styles_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../shared/preview-styles.js */ "./src/shared/preview-styles.js");
/* eslint-env browser */
/**
 * Notibar — Customizer Preview iframe entry point.
 *
 * Bundled by @wordpress/scripts — do NOT edit build/ directly.
 *
 * Subscribes to njt_nofi_bars and njt_nofi_global Customizer settings
 * (both registered with transport=postMessage) and re-renders the bars
 * region in the preview iframe on every change.
 *
 * wp global is provided by the `customize-preview` script dependency
 * declared in AssetLoader::enqueue_customizer_preview(). Using window.wp
 * avoids the ESLint no-redeclare warning that `/* global wp *\/` triggers
 * when the variable is also declared by the dependency script.
 *
 * @since 3.0.0
 */






const SLOT_ID = 'njt-notibar-slot';
const STYLE_ID = 'njt-notibar-preview-style';
const DEBOUNCE_MS = 50;
const FOCUS_EVENT = 'notibar-preview-focus';

// When the controls SPA is in its bar-editor drill-down, it sends a focus
// event with the bar ID being edited. While set, the preview renders ONLY
// that bar (no filtering, no rotation) so the admin always sees what they
// are editing. null = normal display-mode behaviour.
let focusedBarId = null;

// ------------------------------------------------------------------
// Module state
// ------------------------------------------------------------------

let activeRotation = null;
let debounceTimer = null;

// ------------------------------------------------------------------
// Inline style injection
// ------------------------------------------------------------------

/**
 * Inject preview baseline CSS once into the iframe <head>.
 */
function injectPreviewStyles() {
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = _shared_preview_styles_js__WEBPACK_IMPORTED_MODULE_4__.PREVIEW_STYLES;
  document.head.appendChild(style);
}

// ------------------------------------------------------------------
// Slot management
// ------------------------------------------------------------------

/**
 * Return the preview slot element, creating it if absent.
 *
 * @return {HTMLElement} Slot div element.
 */
function ensureSlot() {
  let slot = document.getElementById(SLOT_ID);
  if (!slot) {
    slot = document.createElement('div');
    slot.id = SLOT_ID;
    slot.className = 'njt-nofi-preview-slot';
    document.body.insertBefore(slot, document.body.firstChild);
  }
  return slot;
}

// ------------------------------------------------------------------
// Device detection
// ------------------------------------------------------------------

/**
 * Resolve the current device string using wp.customize.previewedDevice()
 * when available (Customizer responsive toggle), falling back to a
 * matchMedia check. Returns 'desktop' | 'mobile'.
 *
 * @return {string} 'desktop' or 'mobile'.
 */
function resolveDevice() {
  const wp = window.wp;
  if (wp && wp.customize && typeof wp.customize.previewedDevice === 'function') {
    const d = wp.customize.previewedDevice();
    // Customizer returns 'desktop' | 'tablet' | 'mobile'.
    // Treat tablet as mobile for bar display purposes.
    return d === 'desktop' ? 'desktop' : 'mobile';
  }
  // Fallback: infer from viewport width.
  return window.matchMedia('(max-width: 480px)').matches ? 'mobile' : 'desktop';
}

// ------------------------------------------------------------------
// Core re-render
// ------------------------------------------------------------------

/**
 * Parse the current setting values, filter bars, and update the slot DOM.
 * Stops any active rotation before starting a new one to prevent leaks.
 */
function rerender() {
  const wp = window.wp;
  if (!wp || !wp.customize) {
    return;
  }

  // Parse both settings; fall back to empty defaults on bad JSON.
  let bars = [];
  let global = {};
  try {
    bars = JSON.parse(wp.customize('njt_nofi_bars').get() || '[]');
  } catch (e) {
    bars = [];
  }
  try {
    global = JSON.parse(wp.customize('njt_nofi_global').get() || '{}');
  } catch (e) {
    global = {};
  }
  const slot = ensureSlot();

  // Stop previous rotation before touching innerHTML (prevents stale refs).
  if (activeRotation) {
    activeRotation.stop();
    activeRotation = null;
  }

  // Focus override — when the SPA is editing a specific bar, render only
  // that bar. Skip display-logic filter AND rotation: admin must always
  // see the bar being edited regardless of page context or display mode.
  if (focusedBarId) {
    const focused = bars.find(b => b && b.id === focusedBarId);
    if (focused) {
      renderSingle(slot, focused, global);
      wireDismissDelegate(slot);
      return;
    }
    // Focused bar no longer exists (deleted) — fall through to normal mode.
  }

  // Build preview context: permissive (isPreview skips device + dismissal gates).
  // Inherit currentCptType + currentObjectId from the server-emitted data so
  // CPT-targeted bars evaluate correctly in the preview iframe (the iframe
  // IS the previewed URL — its PHP render context reflects the actual page).
  const serverCtx = window.njtNotibarData && window.njtNotibarData.ctx || {};
  const ctx = {
    pageId: 0,
    postId: 0,
    isHome: false,
    device: resolveDevice(),
    dismissed: [],
    isPreview: true,
    currentCptType: serverCtx.currentCptType || '',
    currentObjectId: serverCtx.currentObjectId || 0
  };
  const visible = (0,_shared_filter_bars_js__WEBPACK_IMPORTED_MODULE_1__.filterBars)(bars, ctx);
  if (!visible.length) {
    slot.innerHTML = '';
    return;
  }
  const isRotation = global.displayMode === 'rotation' && visible.length > 1;
  if (isRotation) {
    activeRotation = (0,_shared_rotation_js__WEBPACK_IMPORTED_MODULE_2__.startRotation)({
      slot,
      bars: visible,
      renderFn: _shared_render_bar_js__WEBPACK_IMPORTED_MODULE_0__.renderBarHTML,
      global
    });
  } else {
    renderSingle(slot, visible[0], global);
  }
  wireDismissDelegate(slot);
}

/**
 * Render a single bar into the slot, then flush layout + add visible class
 * so the v2-style slide-in transition plays.
 *
 * @param {HTMLElement} slot   Slot element.
 * @param {Object}      bar    Bar to render.
 * @param {Object}      global Global config (passed through to renderBarHTML).
 */
function renderSingle(slot, bar, global) {
  slot.innerHTML = (0,_shared_render_bar_js__WEBPACK_IMPORTED_MODULE_0__.renderBarHTML)(bar, global);
  const containerContent = slot.querySelector('.njt-nofi-container-content');
  if (containerContent) {
    // Class triggers @keyframes njt-nofi-slide-in animation in
    // notibar.css. Keyframes play unconditionally.
    containerContent.classList.add('njt-nofi-visible');
  }
}

/**
 * Delegate close / toggle clicks on the slot. Re-applies on every render so
 * innerHTML swaps don't drop handlers.
 *
 * @param {HTMLElement} slot Slot element to bind the delegate handler on.
 */
function wireDismissDelegate(slot) {
  slot.onclick = function (e) {
    const btn = e.target.closest('.njt-nofi-close, .njt-nofi-toggle');
    if (!btn) {
      return;
    }
    const barEl = btn.closest('.njt-nofi-container-content');
    if (barEl) {
      barEl.style.display = 'none';
    }
  };
}

// ------------------------------------------------------------------
// Edit affordance — preview-only "Edit" button on each rendered bar.
// Sends the messenger event 'notibar-edit-bar' to the parent Customizer,
// where the SPA drills into the bar editor for that ID.
// ------------------------------------------------------------------

const EDIT_ICON_SVG = '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' + '<path d="M14.7 2.3l3 3-10 10-4 1 1-4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' + '</svg>';
function injectEditButton(slot) {
  // Skip when an external focus is active — the admin is already editing
  // this bar; an Edit button on the bar they're already editing is noise.
  if (focusedBarId) {
    return;
  }
  const cc = slot.querySelector('.njt-nofi-container-content');
  if (!cc || cc.querySelector('.njt-nofi-edit-btn')) {
    return;
  }
  const barId = cc.getAttribute('data-bar-id');
  if (!barId) {
    return;
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'njt-nofi-edit-btn';
  btn.setAttribute('data-bar-id', barId);
  btn.setAttribute('aria-label', 'Edit this notification bar');
  btn.innerHTML = EDIT_ICON_SVG + '<span>Edit</span>';
  cc.appendChild(btn);
}
function installEditAffordance(slot) {
  injectEditButton(slot);
  const mo = new MutationObserver(function () {
    injectEditButton(slot);
  });
  mo.observe(slot, {
    childList: true,
    subtree: true
  });

  // Capture-phase click delegate — runs before the dismiss handler so
  // the Edit click doesn't accidentally trigger any other close/toggle
  // listener that may match on bubble.
  slot.addEventListener('click', function (e) {
    const btn = e.target.closest('.njt-nofi-edit-btn');
    if (!btn) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    const barId = btn.getAttribute('data-bar-id');
    const wp = window.wp;
    if (barId && wp && wp.customize && wp.customize.preview && typeof wp.customize.preview.send === 'function') {
      wp.customize.preview.send('notibar-edit-bar', {
        barId
      });
    }
  }, true);
}

// ------------------------------------------------------------------
// Debounced re-render
// ------------------------------------------------------------------

function scheduleRerender() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(rerender, DEBOUNCE_MS);
}

// ------------------------------------------------------------------
// Bootstrap
// ------------------------------------------------------------------

/**
 * Wire up subscriptions and perform initial render.
 * Called once when the Customizer preview is ready.
 */
function init() {
  const wp = window.wp;
  if (!wp || !wp.customize) {
    return;
  }
  injectPreviewStyles();
  const slot = ensureSlot();

  // v3 — keep iframe body padded by bar height so admin sees what the live
  // frontend layout will look like. Observer handles live re-renders.
  (0,_shared_body_push_js__WEBPACK_IMPORTED_MODULE_3__.installBodyPush)(slot);

  // v3.1 — inject an "Edit" affordance on every preview render so the admin
  // can jump straight from the visual preview into the bar editor.
  installEditAffordance(slot);

  // Subscribe to both settings; each change triggers a debounced re-render.
  wp.customize('njt_nofi_bars', function (setting) {
    setting.bind(scheduleRerender);
  });
  wp.customize('njt_nofi_global', function (setting) {
    setting.bind(scheduleRerender);
  });

  // Listen for SPA focus events — sent when the admin drills into a
  // specific bar editor (or backs out). Payload: { barId: string|null }.
  if (wp.customize.preview && wp.customize.preview.bind) {
    wp.customize.preview.bind(FOCUS_EVENT, function (data) {
      focusedBarId = data && typeof data.barId === 'string' ? data.barId : null;
      scheduleRerender();
    });
  }

  // Initial render on preview load.
  rerender();
}

// Use `customize-preview` ready event so postMessage transport is wired.
if (window.wp && window.wp.customize) {
  window.wp.customize.bind('preview-ready', init);
} else {
  document.addEventListener('DOMContentLoaded', init);
}
})();

/******/ })()
;
//# sourceMappingURL=customizer-preview.js.map