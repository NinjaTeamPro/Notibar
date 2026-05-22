/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/frontend/cookies.js"
/*!*********************************!*\
  !*** ./src/frontend/cookies.js ***!
  \*********************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COOKIE_PREFIX: () => (/* binding */ COOKIE_PREFIX),
/* harmony export */   dismiss: () => (/* binding */ dismiss),
/* harmony export */   isDismissed: () => (/* binding */ isDismissed)
/* harmony export */ });
/**
 * Notibar — Per-bar cookie management.
 *
 * Each dismissed bar gets its own cookie: njt-notibar-{id}=1
 * TTL is driven by bar.behavior.reopenAfterDays.
 * A value of 0 means session cookie (no Max-Age).
 *
 * @since 3.0.0
 */
/* eslint-env browser */

/** @type {string} */
const COOKIE_PREFIX = 'njt-notibar-';

/**
 * Check whether the given bar ID has a dismissal cookie set.
 *
 * @param {string|number} id Bar ID.
 * @return {boolean} true if the bar is dismissed.
 */
function isDismissed(id) {
  const needle = COOKIE_PREFIX + String(id) + '=';
  return document.cookie.split('; ').some(c => c.startsWith(needle));
}

/**
 * Set the dismissal cookie for the given bar.
 *
 * @param {string|number} id   Bar ID.
 * @param {number}        days Number of days to keep cookie. 0 = session cookie.
 * @return {void}
 */
function dismiss(id, days) {
  const safeDays = Math.max(0, Number(days) || 0);
  const maxAge = safeDays > 0 ? `; Max-Age=${safeDays * 86400}` : '';
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_PREFIX}${String(id)}=1; Path=/; SameSite=Lax${maxAge}${secure}`;
}

/***/ },

/***/ "./src/frontend/theme-compat.js"
/*!**************************************!*\
  !*** ./src/frontend/theme-compat.js ***!
  \**************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyThemeCompat: () => (/* binding */ applyThemeCompat)
/* harmony export */ });
/* harmony import */ var _theme_compat_divi__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./theme-compat/divi */ "./src/frontend/theme-compat/divi.js");
/* harmony import */ var _theme_compat_essentials__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./theme-compat/essentials */ "./src/frontend/theme-compat/essentials.js");
/* harmony import */ var _theme_compat_nayma_konte__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./theme-compat/nayma-konte */ "./src/frontend/theme-compat/nayma-konte.js");
/* harmony import */ var _theme_compat_enfold_uncode__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./theme-compat/enfold-uncode */ "./src/frontend/theme-compat/enfold-uncode.js");
/* harmony import */ var _theme_compat_misc_themes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./theme-compat/misc-themes */ "./src/frontend/theme-compat/misc-themes.js");
/**
 * Notibar — Theme-compatibility registry.
 *
 * Dispatches the correct theme-compat callback for the active theme.
 * Each callback receives the #njt-notibar-slot element and patches
 * header/nav positioning to accommodate the notification bar.
 *
 * All 11 legacy theme hacks are retained per resolved decision #6:
 *   Divi, Essentials, Nayma, Konte, Enfold, Uncode,
 *   Uptime Child, Themify Ultra, Salient, Radiate Child,
 *   AccessPress Parallax Pro Child.
 *
 * Registry keys are theme display Names (e.g. "Divi", "Salient") to match
 * legacy v2.1.9 1:1. PHP passes wp_get_theme()->get('Name') as ctx.theme.
 *
 * @since 3.0.0
 */







/**
 * Map of theme stylesheet slug → compat callback.
 *
 * @type {Object.<string, function(HTMLElement): void>}
 */
const THEME_FIXES = {
  // 1. Divi
  Divi: _theme_compat_divi__WEBPACK_IMPORTED_MODULE_0__.applyDivi,
  // 2. Divi Child Theme for CDW Studios (same fixes as Divi)
  'Divi Child Theme for CDW Studios': _theme_compat_divi__WEBPACK_IMPORTED_MODULE_0__.applyDivi,
  // 3. Essentials
  Essentials: _theme_compat_essentials__WEBPACK_IMPORTED_MODULE_1__.applyEssentials,
  // 4. Nayma
  Nayma: _theme_compat_nayma_konte__WEBPACK_IMPORTED_MODULE_2__.applyNayma,
  // 5. Konte
  Konte: _theme_compat_nayma_konte__WEBPACK_IMPORTED_MODULE_2__.applyKonte,
  // 6. Enfold
  Enfold: _theme_compat_enfold_uncode__WEBPACK_IMPORTED_MODULE_3__.applyEnfold,
  // 7. Uncode
  Uncode: _theme_compat_enfold_uncode__WEBPACK_IMPORTED_MODULE_3__.applyUncode,
  // 8. Uptime Child
  'Uptime Child': _theme_compat_misc_themes__WEBPACK_IMPORTED_MODULE_4__.applyUptimeChild,
  // 9. Themify Ultra
  'Themify Ultra': _theme_compat_misc_themes__WEBPACK_IMPORTED_MODULE_4__.applyThemifyUltra,
  // 10. Salient
  Salient: _theme_compat_misc_themes__WEBPACK_IMPORTED_MODULE_4__.applySalient,
  // 11. Radiate Child
  'Radiate Child': _theme_compat_misc_themes__WEBPACK_IMPORTED_MODULE_4__.applyRadiateChild,
  // 12. AccessPress Parallax Pro Child
  'AccessPress Parallax Pro Child': _theme_compat_misc_themes__WEBPACK_IMPORTED_MODULE_4__.applyAccessPressParallax
};

/**
 * Apply the theme-compatibility callback for the active theme, if one exists.
 *
 * Safe to call with an unknown theme slug — no-ops gracefully.
 *
 * @param {string}      themeSlug Active theme stylesheet slug (ctx.theme).
 * @param {HTMLElement} slot      The #njt-notibar-slot element.
 * @return {void}
 */
function applyThemeCompat(themeSlug, slot) {
  const fix = THEME_FIXES[themeSlug];
  if (typeof fix === 'function') {
    fix(slot);
  }
}

/***/ },

/***/ "./src/frontend/theme-compat/divi.js"
/*!*******************************************!*\
  !*** ./src/frontend/theme-compat/divi.js ***!
  \*******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyDivi: () => (/* binding */ applyDivi)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/frontend/theme-compat/helpers.js");
/**
 * Theme-compat: Divi / Divi Child Theme for CDW Studios.
 * Ported verbatim from legacy notibar.js supportDiviTheme().
 *
 * @since 3.0.0
 */



/**
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyDivi(slot) {
  const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
  const adminOffset = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? 32 : 0;
  setTimeout(() => {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('header#main-header', {
      top: h + adminOffset + 'px'
    });
  }, 1000);
  document.body.style.paddingTop = h + 'px';
  document.body.style.position = 'relative';
  const bar = slot.querySelector('.njt-nofi-notification-bar');
  const isVisible = bar && bar.offsetParent !== null;
  if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)()) {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_0_tb_header', {
      top: '32px'
    });
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_1_tb_header', {
      top: '62px'
    });
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_0_tb_header.et_pb_sticky--top', {
      top: isVisible ? '66px' : '32px'
    });
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_1_tb_header.et_pb_sticky--top', {
      top: isVisible ? '96px' : '62px'
    });
  } else {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_0_tb_header', {
      top: '0px'
    });
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_1_tb_header', {
      top: '30px'
    });
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_0_tb_header.et_pb_sticky--top', {
      top: isVisible ? '34px' : '0px'
    });
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.et_pb_section_1_tb_header.et_pb_sticky--top', {
      top: isVisible ? '64px' : '30px'
    });
  }
}

/***/ },

/***/ "./src/frontend/theme-compat/enfold-uncode.js"
/*!****************************************************!*\
  !*** ./src/frontend/theme-compat/enfold-uncode.js ***!
  \****************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyEnfold: () => (/* binding */ applyEnfold),
/* harmony export */   applyUncode: () => (/* binding */ applyUncode)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/frontend/theme-compat/helpers.js");
/**
 * Theme-compat: Enfold + Uncode.
 * Ported verbatim from legacy notibar.js supportEnfoldTheme() / supportUncodeTheme().
 *
 * @since 3.0.0
 */
/* eslint-env browser */



/**
 * Enfold — absolute-position header offset with transparency check.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyEnfold(slot) {
  const container = slot.querySelector('.njt-nofi-container');
  if (!container || getComputedStyle(container).position !== 'absolute') {
    return;
  }
  const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
  setTimeout(() => {
    const header = document.querySelector('body header.av_header_border_disabled');
    if (header && !header.classList.contains('av_header_transparency')) {
      header.style.top = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? '32px' : '0';
    }
  }, 500);
  window.addEventListener('wheel', function (event) {
    if (event.deltaY > 0) {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header.av_header_border_disabled', {
        top: (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? '32px' : '0'
      });
    } else {
      const hasTransp = !!document.querySelector('header.av_header_transparency');
      if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)()) {
        (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header.av_header_border_disabled', {
          top: (hasTransp ? 32 + h : 32) + 'px'
        });
      } else {
        (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header.av_header_border_disabled', {
          top: hasTransp ? h + 'px' : '0'
        });
      }
    }
  });
}

/**
 * Uncode — body padding-top delay hack.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyUncode(slot) {
  const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
  setTimeout(() => {
    document.body.style.paddingTop = h + 'px';
  }, 1500);
  window.addEventListener('wheel', function () {
    setTimeout(() => {
      document.body.style.paddingTop = h + 'px';
    }, 1000);
  });
}

/***/ },

/***/ "./src/frontend/theme-compat/essentials.js"
/*!*************************************************!*\
  !*** ./src/frontend/theme-compat/essentials.js ***!
  \*************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyEssentials: () => (/* binding */ applyEssentials)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/frontend/theme-compat/helpers.js");
/**
 * Theme-compat: Essentials.
 * Ported verbatim from legacy notibar.js supportEssentialsTheme().
 *
 * @since 3.0.0
 */



/**
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyEssentials(slot) {
  window.addEventListener('scroll', function () {
    const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
    if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)()) {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body.admin-bar #masthead.pix-header', {
        top: '0'
      });
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body.admin-bar #masthead.pix-header.is-scroll', {
        top: h + 32 + 'px'
      });
    } else {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body #masthead.pix-header', {
        top: '0'
      });
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body #masthead.pix-header.is-scroll', {
        top: h + 'px'
      });
    }
  });
}

/***/ },

/***/ "./src/frontend/theme-compat/helpers.js"
/*!**********************************************!*\
  !*** ./src/frontend/theme-compat/helpers.js ***!
  \**********************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   barHeight: () => (/* binding */ barHeight),
/* harmony export */   hasAdminBar: () => (/* binding */ hasAdminBar),
/* harmony export */   isSlotHidden: () => (/* binding */ isSlotHidden),
/* harmony export */   setStyles: () => (/* binding */ setStyles),
/* harmony export */   setStylesAll: () => (/* binding */ setStylesAll)
/* harmony export */ });
/**
 * Shared helper utilities for theme-compat callbacks.
 *
 * All callbacks receive the #njt-notibar-slot element and only mutate
 * external selectors' positioning to accommodate the bar height.
 *
 * @since 3.0.0
 */

/**
 * Apply styles to a single matched element.
 *
 * @param {string} selector CSS selector.
 * @param {Object} styles   Style key/value pairs.
 * @return {void}
 */
function setStyles(selector, styles) {
  const el = document.querySelector(selector);
  if (!el) {
    return;
  }
  Object.assign(el.style, styles);
}

/**
 * Apply styles to all matched elements.
 *
 * @param {string} selector CSS selector.
 * @param {Object} styles   Style key/value pairs.
 * @return {void}
 */
function setStylesAll(selector, styles) {
  document.querySelectorAll(selector).forEach(el => {
    Object.assign(el.style, styles);
  });
}

/**
 * Returns true if the WP admin bar is present in the DOM.
 *
 * @return {boolean} True when #wpadminbar exists in the document.
 */
function hasAdminBar() {
  return !!document.querySelector('#wpadminbar');
}

/**
 * Measure the current height of the first .njt-nofi-notification-bar
 * inside the slot.
 *
 * @param {HTMLElement} slot
 * @return {number} Height in pixels (0 if bar not found).
 */
function barHeight(slot) {
  const bar = slot.querySelector('.njt-nofi-notification-bar');
  return bar ? bar.offsetHeight : 0;
}

/**
 * Returns true if the slot is effectively hidden (dismissed by user).
 * Used in Konte/Uptime callbacks as a proxy for "bar dismissed".
 *
 * @param {HTMLElement} slot
 * @return {boolean} True when slot is display:none or otherwise off-flow.
 */
function isSlotHidden(slot) {
  return slot.style.display === 'none' || !slot.offsetParent;
}

/***/ },

/***/ "./src/frontend/theme-compat/misc-themes.js"
/*!**************************************************!*\
  !*** ./src/frontend/theme-compat/misc-themes.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyAccessPressParallax: () => (/* binding */ applyAccessPressParallax),
/* harmony export */   applyRadiateChild: () => (/* binding */ applyRadiateChild),
/* harmony export */   applySalient: () => (/* binding */ applySalient),
/* harmony export */   applyThemifyUltra: () => (/* binding */ applyThemifyUltra),
/* harmony export */   applyUptimeChild: () => (/* binding */ applyUptimeChild)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/frontend/theme-compat/helpers.js");
/**
 * Theme-compat: Uptime Child, Themify Ultra, Salient,
 *               Radiate Child, AccessPress Parallax Pro Child.
 *
 * Ported verbatim from legacy notibar.js:
 *  supportUptimeChildTheme / supportThemifyUltraTheme /
 *  supportSalient / supportRadiateChild / supportAccessPressParallaxTheme.
 *
 * @since 3.0.0
 */
/* eslint-env browser */



/**
 * Uptime Child — navbar top offset on wheel scroll.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyUptimeChild(slot) {
  const container = slot.querySelector('.njt-nofi-container');
  if (!container || getComputedStyle(container).position !== 'fixed') {
    return;
  }
  const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
  window.addEventListener('wheel', function (event) {
    if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.isSlotHidden)(slot)) {
      return;
    }
    if (event.deltaY < 0) {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.navbar.scrolled', {
        top: h + 'px'
      });
    } else {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.navbar', {
        top: '0'
      });
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('.navbar.scrolled', {
        top: h + 'px'
      });
    }
  });
}

/**
 * Themify Ultra — headerwrap top on wheel scroll.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyThemifyUltra(slot) {
  const bar = slot.querySelector('.njt-nofi-notification-bar');
  const isBarVisible = bar && bar.offsetParent !== null;
  const offset = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? 56 : 32;
  window.addEventListener('wheel', function () {
    if (isBarVisible) {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStylesAll)('#headerwrap.tf_box.tf_w, #headerwrap.tf_box.tf_w.fixed-header', {
        top: offset + 'px'
      });
    } else {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('#headerwrap', {
        top: '0px'
      });
    }
  });
}

/**
 * Salient — header#top top offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applySalient(slot) {
  const bar = slot.querySelector('.njt-nofi-notification-bar');
  if (bar && bar.offsetParent !== null) {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('header#top', {
      top: (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot) + 'px'
    });
  }
}

/**
 * Radiate Child — .header-wrap top offset + body padding reset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyRadiateChild(slot) {
  const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
  const paddingOffset = h + ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? 32 : 0);
  setTimeout(() => {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body .header-wrap', {
      top: paddingOffset + 'px'
    });
    document.body.style.paddingTop = '0';
  }, 1000);
  window.addEventListener('wheel', function () {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body .header-wrap', {
      top: paddingOffset + 'px'
    });
  });
}

/**
 * AccessPress Parallax Pro Child — masthead + menu-fix top offsets.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyAccessPressParallax(slot) {
  const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
  setTimeout(() => {
    (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('header#masthead', {
      top: ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? h + 32 : h) + 'px'
    });
  }, 1000);
  let lastScrollTop = 0;
  window.addEventListener('scroll', function () {
    if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.isSlotHidden)(slot)) {
      return;
    }
    const st = window.scrollY || document.documentElement.scrollTop;
    if (st >= lastScrollTop) {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('#main-header.menu-fix', {
        top: h + 'px'
      });
    }
    lastScrollTop = st;
  });
}

/***/ },

/***/ "./src/frontend/theme-compat/nayma-konte.js"
/*!**************************************************!*\
  !*** ./src/frontend/theme-compat/nayma-konte.js ***!
  \**************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyKonte: () => (/* binding */ applyKonte),
/* harmony export */   applyNayma: () => (/* binding */ applyNayma)
/* harmony export */ });
/* harmony import */ var _helpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./helpers */ "./src/frontend/theme-compat/helpers.js");
/**
 * Theme-compat: Nayma + Konte.
 * Ported verbatim from legacy notibar.js supportNaymaTheme() / supportKonteTheme().
 *
 * @since 3.0.0
 */
/* eslint-env browser */



/**
 * Nayma — fixed-header scroll offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyNayma(slot) {
  const container = slot.querySelector('.njt-nofi-container');
  if (!container || getComputedStyle(container).position !== 'fixed') {
    return;
  }
  window.addEventListener('wheel', function (event) {
    let h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
    // v3: collapsed state lives on .njt-nofi-container-content via
    // .njt-nofi-collapsed (was .njt-nofi-toggle-close on the bar in v2).
    const content = slot.querySelector('.njt-nofi-container-content');
    if (content && content.classList.contains('njt-nofi-collapsed')) {
      h = 0;
    }
    if (event.deltaY < 0) {
      if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)()) {
        (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header .fixed-header', {
          top: h + 32 + 'px'
        });
      } else {
        (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header .fixed-header', {
          top: h + 'px'
        });
      }
    }
  });
}

/**
 * Konte — sticky header scroll offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
function applyKonte(slot) {
  const container = slot.querySelector('.njt-nofi-container');
  if (!container || getComputedStyle(container).position !== 'fixed') {
    return;
  }
  window.addEventListener('wheel', function (event) {
    const h = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.barHeight)(slot);
    const dismissed = (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.isSlotHidden)(slot);
    if (dismissed) {
      if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)()) {
        const isSticky = !!document.querySelector('body header#masthead.header-sticky--normal.sticky');
        (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header#masthead.header-sticky--normal', {
          top: isSticky ? '32px' : '0'
        });
      } else {
        (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header#masthead.header-sticky--normal', {
          top: '0'
        });
      }
    } else if (event.deltaY < 0) {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header#masthead.header-sticky--normal.sticky', {
        top: ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)() ? h + 32 : h) + 'px'
      });
    } else if ((0,_helpers__WEBPACK_IMPORTED_MODULE_0__.hasAdminBar)()) {
      const isSticky = !!document.querySelector('body header#masthead.header-sticky--normal.sticky');
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header#masthead.header-sticky--normal', {
        top: (isSticky ? h + 32 : h) + 'px'
      });
    } else {
      (0,_helpers__WEBPACK_IMPORTED_MODULE_0__.setStyles)('body header#masthead.header-sticky--normal.sticky', {
        top: h + 'px'
      });
    }
  });
}

/***/ },

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
/*!*******************************!*\
  !*** ./src/frontend/index.js ***!
  \*******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _shared_filter_bars__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../shared/filter-bars */ "./src/shared/filter-bars.js");
/* harmony import */ var _shared_render_bar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../shared/render-bar */ "./src/shared/render-bar.js");
/* harmony import */ var _shared_rotation__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../shared/rotation */ "./src/shared/rotation.js");
/* harmony import */ var _shared_body_push__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../shared/body-push */ "./src/shared/body-push.js");
/* harmony import */ var _cookies__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cookies */ "./src/frontend/cookies.js");
/* harmony import */ var _theme_compat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./theme-compat */ "./src/frontend/theme-compat.js");
/**
 * Notibar — Frontend runtime entry point.
 *
 * Reads window.njtNotibarData (inlined by PHP), filters bars client-side,
 * renders first survivor, wires dismissal/toggle handlers, starts rotation
 * when applicable, and applies theme-compat callbacks.
 *
 * No jQuery. Vanilla JS only.
 *
 * @since 3.0.0
 */
/* eslint-env browser */







const COLLAPSED_CLASS = 'njt-nofi-collapsed';
const COLLAPSED_STORAGE_PREFIX = 'njt-notibar-';
const COLLAPSED_STORAGE_SUFFIX = '-collapsed';
function collapsedKey(barId) {
  return `${COLLAPSED_STORAGE_PREFIX}${barId}${COLLAPSED_STORAGE_SUFFIX}`;
}
function isCollapsed(barId) {
  try {
    return window.sessionStorage.getItem(collapsedKey(barId)) === '1';
  } catch (e) {
    return false; // Private mode etc. — graceful no-op.
  }
}
function setCollapsed(barId, collapsed) {
  try {
    const key = collapsedKey(barId);
    if (collapsed) {
      window.sessionStorage.setItem(key, '1');
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch (e) {
    // no-op
  }
}

/**
 * Wrapper around renderBarHTML that re-applies persisted collapsed state
 * after the markup is emitted. Used everywhere instead of renderBarHTML so
 * rotation, dismiss-rerender, and initial-render paths all stay consistent.
 *
 * @param {Object} bar
 * @param {Object} globalConfig
 * @return {string} HTML markup (possibly with .njt-nofi-collapsed injected).
 */
function renderBarWithCollapsedState(bar, globalConfig) {
  const html = (0,_shared_render_bar__WEBPACK_IMPORTED_MODULE_1__.renderBarHTML)(bar, globalConfig);
  if (!isCollapsed(bar.id)) {
    return html;
  }
  return html.replace('class="njt-nofi-container-content"', `class="njt-nofi-container-content ${COLLAPSED_CLASS}"`);
}

/**
 * Detect current device type via media query.
 *
 * @return {'mobile'|'desktop'} Active device class based on viewport width.
 */
function detectDevice() {
  return matchMedia('(max-width:480px)').matches ? 'mobile' : 'desktop';
}

/**
 * Initialise the frontend notification bar runtime.
 *
 * @return {void}
 */
function init() {
  const data = window.njtNotibarData;
  if (!data) {
    return;
  }
  const {
    bars = [],
    global: globalConfig = {},
    ctx = {}
  } = data;
  if (!bars.length) {
    return;
  }

  // Resolve slot — server emits it; fall back to creating one.
  let slot = document.getElementById('njt-notibar-slot');
  if (!slot) {
    slot = document.createElement('div');
    slot.id = 'njt-notibar-slot';
    slot.setAttribute('role', 'status');
    slot.setAttribute('aria-live', 'polite');
    document.body.appendChild(slot);
  }

  // Honour reduced-motion preference — no rotation, single render only.
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Build client-side context.
  ctx.device = detectDevice();
  ctx.dismissed = bars.filter(b => (0,_cookies__WEBPACK_IMPORTED_MODULE_4__.isDismissed)(b.id)).map(b => String(b.id));
  ctx.isPreview = false;
  let survivors = (0,_shared_filter_bars__WEBPACK_IMPORTED_MODULE_0__.filterBars)(bars, ctx);
  if (!survivors.length) {
    slot.style.display = 'none';
    return;
  }

  /** @type {{ stop: Function }|null} */
  let rotationCtrl = null;

  // -----------------------------------------------------------------------
  // Dismissal handler — called on × button click.
  // -----------------------------------------------------------------------
  function handleDismiss(barId) {
    const bar = survivors.find(b => String(b.id) === String(barId));
    if (bar) {
      (0,_cookies__WEBPACK_IMPORTED_MODULE_4__.dismiss)(barId, bar.behavior ? bar.behavior.reopenAfterDays : 0);
    }
    survivors = survivors.filter(b => String(b.id) !== String(barId));
    if (!survivors.length) {
      slot.style.display = 'none';
      if (rotationCtrl) {
        rotationCtrl.stop();
      }
      return;
    }

    // If rotation is active, update its bar list; otherwise re-render first.
    if (rotationCtrl) {
      // Restart rotation with the reduced survivors list.
      rotationCtrl.stop();
      rotationCtrl = (0,_shared_rotation__WEBPACK_IMPORTED_MODULE_2__.startRotation)({
        slot,
        bars: survivors,
        renderFn: renderBarWithCollapsedState,
        global: globalConfig
      });
    } else {
      slot.innerHTML = renderBarWithCollapsedState(survivors[0], globalConfig);
    }
  }

  // -----------------------------------------------------------------------
  // Toggle handler — collapses/expands the currently-active bar's container.
  // Persists per-bar to sessionStorage (no cookie — survives within session
  // but not across reload-after-close per spec).
  // -----------------------------------------------------------------------
  function handleToggle(barId) {
    const wasCollapsed = isCollapsed(barId);
    setCollapsed(barId, !wasCollapsed);
    const container = slot.querySelector(`[data-bar-id="${CSS.escape(barId)}"]`);
    if (container) {
      container.classList.toggle(COLLAPSED_CLASS, !wasCollapsed);
    }
  }

  // -----------------------------------------------------------------------
  // Delegated click handler on slot.
  // -----------------------------------------------------------------------
  slot.addEventListener('click', function (e) {
    const closeBtn = e.target.closest('.njt-nofi-close');
    if (closeBtn) {
      const container = closeBtn.closest('[data-bar-id]');
      const barId = container ? container.dataset.barId : null;
      if (barId) {
        handleDismiss(barId);
      }
      return;
    }
    const toggleBtn = e.target.closest('.njt-nofi-toggle');
    if (toggleBtn) {
      const container = toggleBtn.closest('[data-bar-id]');
      const barId = container ? container.dataset.barId : null;
      if (barId) {
        handleToggle(barId);
      }
    }
  });

  // -----------------------------------------------------------------------
  // Render — rotation or single.
  // -----------------------------------------------------------------------
  const useRotation = !prefersReducedMotion && globalConfig.displayMode === 'rotation' && survivors.length > 1;
  if (useRotation) {
    rotationCtrl = (0,_shared_rotation__WEBPACK_IMPORTED_MODULE_2__.startRotation)({
      slot,
      bars: survivors,
      renderFn: renderBarWithCollapsedState,
      global: globalConfig
    });
  } else {
    slot.innerHTML = renderBarWithCollapsedState(survivors[0], globalConfig);
  }

  // Reveal — class triggers the @keyframes njt-nofi-slide-in animation
  // on the bar (slide-down + fade-in). Keyframes play unconditionally
  // when the rule matches, so no rAF / reflow dance needed.
  const containerContent = slot.querySelector('.njt-nofi-container-content');
  if (containerContent) {
    containerContent.classList.add('njt-nofi-visible');
  }

  // Theme-compat patches.
  (0,_theme_compat__WEBPACK_IMPORTED_MODULE_5__.applyThemeCompat)(ctx.theme, slot);

  // v3 — push body down by bar height so site header isn't covered by a
  // fixed/absolute-positioned bar. ResizeObserver re-syncs on rotation,
  // collapse-toggle, dismiss, and responsive breakpoint changes.
  (0,_shared_body_push__WEBPACK_IMPORTED_MODULE_3__.installBodyPush)(slot);

  // Emit custom event so themes/plugins can hook post-render.
  slot.dispatchEvent(new CustomEvent('njt_nofi_bar_rendered', {
    bubbles: true
  }));
}
document.addEventListener('DOMContentLoaded', init);
})();

/******/ })()
;
//# sourceMappingURL=frontend.js.map