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
export function setStyles( selector, styles ) {
	const el = document.querySelector( selector );
	if ( ! el ) {
		return;
	}
	Object.assign( el.style, styles );
}

/**
 * Apply styles to all matched elements.
 *
 * @param {string} selector CSS selector.
 * @param {Object} styles   Style key/value pairs.
 * @return {void}
 */
export function setStylesAll( selector, styles ) {
	document.querySelectorAll( selector ).forEach( ( el ) => {
		Object.assign( el.style, styles );
	} );
}

/**
 * Returns true if the WP admin bar is present in the DOM.
 *
 * @return {boolean} True when #wpadminbar exists in the document.
 */
export function hasAdminBar() {
	return !! document.querySelector( '#wpadminbar' );
}

/**
 * Live admin bar height: 0 when absent, 32px desktop, 46px on viewports
 * ≤782px. Always measure at use time (never cache) — the value flips at
 * the responsive breakpoint without any DOM mutation.
 *
 * @return {number} Current #wpadminbar height in pixels.
 */
export function adminBarHeight() {
	const bar = document.getElementById( 'wpadminbar' );
	return bar ? bar.offsetHeight : 0;
}

/**
 * Height of the top bar/stack that a theme sticky header must clear.
 *
 * Measures the top-pinned element (the stack wrapper in stack mode, else the
 * lone container, via topPinnedEl).
 *
 * Fixed vs absolute: a FIXED bar never scrolls, so its `rect.bottom` is constant
 * and this returns the full height (unchanged behavior). An ABSOLUTE bar/stack
 * scrolls UP with the page — return only the height still visible below the
 * admin bar, clamped to [0, full]. A sticky header (re-synced on scroll) then
 * TRACKS the bar down to flush instead of holding the full offset and leaving a
 * gap that grows with scroll. At rest (scroll 0) `rect.bottom - adminBar` equals
 * the full height for both positions, so behavior is identical when not scrolled.
 *
 * @param {HTMLElement} slot
 * @return {number} Height in pixels (0 when no top bar is present).
 */
export function barHeight( slot ) {
	const top = topPinnedEl( slot );
	if ( ! top ) {
		return 0;
	}
	const full = top.offsetHeight;
	const visible = top.getBoundingClientRect().bottom - adminBarHeight();
	return Math.max( 0, Math.min( full, visible ) );
}

/**
 * The floating element that carries the notibar's positioning: the stack
 * wrapper in stack mode (the inner `.njt-nofi-container`s are forced
 * `position:static`), else the lone `.njt-nofi-container`. Shims read its
 * computed `position` to gate scroll fixups — in stack mode the wrapper holds
 * the real `fixed`/`absolute` value (from `global.stackPositionType`).
 *
 * @param {HTMLElement} slot
 * @return {HTMLElement|null} The positioned element, or null when none exists.
 */
export function positionedEl( slot ) {
	return (
		slot.querySelector( '.njt-nofi-stack' ) ||
		slot.querySelector( '.njt-nofi-container' )
	);
}

/**
 * Returns true if the slot is effectively hidden (dismissed by user).
 * Used in Konte/Uptime callbacks as a proxy for "bar dismissed".
 *
 * @param {HTMLElement} slot
 * @return {boolean} True when slot is display:none or otherwise off-flow.
 */
export function isSlotHidden( slot ) {
	return slot.style.display === 'none' || ! slot.offsetParent;
}

/**
 * The positioned element that is pinned to the TOP, or null when none is.
 *
 * Stack mode (Pro): the top stack wrapper `.njt-nofi-stack[data-placement='top']`
 * — the inner `.njt-nofi-container`s are `position:static` inside it, so the
 * wrapper is the authoritative positioned/measurable element. Single/rotation:
 * the lone `.njt-nofi-container`, only when it is top-placed.
 *
 * @param {HTMLElement} slot
 * @return {HTMLElement|null} The top-pinned element, or null.
 */
function topPinnedEl( slot ) {
	const stackTop = slot.querySelector(
		".njt-nofi-stack[data-placement='top']"
	);
	if ( stackTop ) {
		return stackTop;
	}
	const container = slot.querySelector( '.njt-nofi-container' );
	if (
		container &&
		'bottom' !== container.getAttribute( 'data-placement' )
	) {
		return container;
	}
	return null;
}

/**
 * True when a visible bar is pinned to the TOP — the only case where theme
 * headers need pushing down. Bottom-placed, dismissed, or rotated-out bars
 * must leave header offsets at their theme-native values.
 *
 * Re-read this per event/sync (never capture at init): rotation can swap in
 * a bar with a different placement at any time, and stack mode renders a top
 * wrapper holding multiple bars.
 *
 * @param {HTMLElement} slot
 * @return {boolean} True when an active top-pinned bar/stack is visible.
 */
export function hasTopBar( slot ) {
	if ( isSlotHidden( slot ) ) {
		return false;
	}
	// The positioned, top-pinned element: the stack top wrapper in stack mode,
	// else the lone container when it is top-placed. Rect height instead of
	// offsetParent: position:fixed elements report a null offsetParent even
	// when visible.
	const top = topPinnedEl( slot );
	if ( ! top || top.getBoundingClientRect().height === 0 ) {
		return false;
	}
	// An absolute bar/stack scrolls away with the document — once it has fully
	// left the viewport, theme headers must return to their native position.
	// Fixed elements never leave the viewport, so no scroll check applies.
	if (
		'absolute' === top.getAttribute( 'data-position' ) &&
		top.getBoundingClientRect().bottom <= 0
	) {
		return false;
	}
	return true;
}

/**
 * Build a sync() that maintains a persistent <style> element holding a
 * bar-height-dependent CSS rule. The rule is present only while a visible
 * top-placed bar is active; otherwise the element is emptied (never removed).
 *
 * For themes whose sticky header is positioned by a stylesheet rule (not
 * per-scroll inline writes) — a CSS override composes without racing the
 * theme's own JS.
 *
 * @param {HTMLElement} slot
 * @param {string}      styleId      Unique id for the owned <style> element.
 * @param {Function}    cssForHeight (h: number) => string CSS rule block.
 * @return {Function} sync callback (dispatcher contract).
 */
export function makeBarOffsetStyleSync( slot, styleId, cssForHeight ) {
	return function sync() {
		let el = document.getElementById( styleId );
		if ( ! el ) {
			if ( ! document.head ) {
				return;
			}
			el = document.createElement( 'style' );
			el.id = styleId;
			document.head.appendChild( el );
		}
		const h = hasTopBar( slot ) ? barHeight( slot ) : 0;
		el.textContent = h > 0 ? cssForHeight( h ) : '';
	};
}
