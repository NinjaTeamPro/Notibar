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
 * Measure the current height of the first .njt-nofi-notification-bar
 * inside the slot.
 *
 * @param {HTMLElement} slot
 * @return {number} Height in pixels (0 if bar not found).
 */
export function barHeight( slot ) {
	const bar = slot.querySelector( '.njt-nofi-notification-bar' );
	return bar ? bar.offsetHeight : 0;
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
 * Read the current bar's placement from its data-placement attribute.
 *
 * @param {HTMLElement} slot
 * @return {'top'|'bottom'} Placement of the rendered bar ('top' default).
 */
export function barPlacement( slot ) {
	const bar = slot.querySelector( '.njt-nofi-container' );
	return bar && 'bottom' === bar.getAttribute( 'data-placement' )
		? 'bottom'
		: 'top';
}

/**
 * True when a visible bar is pinned to the TOP — the only case where theme
 * headers need pushing down. Bottom-placed, dismissed, or rotated-out bars
 * must leave header offsets at their theme-native values.
 *
 * Re-read this per event/sync (never capture at init): rotation can swap in
 * a bar with a different placement at any time.
 *
 * @param {HTMLElement} slot
 * @return {boolean} True when an active top-placed bar is visible.
 */
export function hasTopBar( slot ) {
	if ( isSlotHidden( slot ) ) {
		return false;
	}
	const bar = slot.querySelector( '.njt-nofi-notification-bar' );
	if ( ! bar ) {
		return false;
	}
	// Rect height instead of offsetParent: position:fixed elements report a
	// null offsetParent even when visible.
	if ( bar.getBoundingClientRect().height === 0 ) {
		return false;
	}
	// An absolute bar scrolls away with the document — once it has fully
	// left the viewport, theme headers must return to their native
	// position. Fixed bars never leave the viewport, so no scroll check.
	// Measured on the container: it is the positioned element, so its rect
	// is authoritative even if inner elements are offset within it.
	const container = slot.querySelector( '.njt-nofi-container' );
	if (
		container &&
		'absolute' === container.getAttribute( 'data-position' ) &&
		container.getBoundingClientRect().bottom <= 0
	) {
		return false;
	}
	return 'top' === barPlacement( slot );
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
