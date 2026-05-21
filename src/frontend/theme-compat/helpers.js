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
