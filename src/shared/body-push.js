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

const PUSH_POSITIONS = new Set( [ 'fixed', 'absolute' ] );

function setBodyPad( px ) {
	if ( px > 0 ) {
		document.body.style.setProperty( 'padding-top', px + 'px', 'important' );
	} else {
		document.body.style.removeProperty( 'padding-top' );
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
export function installBodyPush( slot ) {
	if ( ! slot || typeof ResizeObserver === 'undefined' ) {
		return function noop() {};
	}

	let currentBar  = null;
	let sizeObserver = null;

	function sync() {
		if ( ! currentBar ) {
			setBodyPad( 0 );
			return;
		}
		// Bar height only — WP's html margin-top handles the admin-bar offset.
		setBodyPad( currentBar.offsetHeight );
	}

	function attach( bar ) {
		if ( sizeObserver ) {
			sizeObserver.disconnect();
			sizeObserver = null;
		}
		currentBar = bar;
		if ( ! bar ) {
			setBodyPad( 0 );
			return;
		}
		const pos = bar.getAttribute( 'data-position' ) || 'fixed';
		if ( ! PUSH_POSITIONS.has( pos ) ) {
			setBodyPad( 0 );
			return;
		}
		sizeObserver = new ResizeObserver( sync );
		sizeObserver.observe( bar );
		sync();
	}

	function findBar() {
		return slot.querySelector( '.njt-nofi-container' );
	}

	attach( findBar() );

	// Re-attach when the slot's children change (rotation swaps the bar element,
	// dismiss removes it, Customizer preview live-replaces it on every keystroke).
	const slotObserver = new MutationObserver( function () {
		const bar = findBar();
		if ( bar !== currentBar ) {
			attach( bar );
		}
	} );
	slotObserver.observe( slot, { childList: true, subtree: true } );

	// Admin-bar offset depends on viewport width (32 vs 46px boundary at 783px).
	function onResize() {
		sync();
	}
	window.addEventListener( 'resize', onResize );

	return function uninstall() {
		if ( sizeObserver ) {
			sizeObserver.disconnect();
		}
		slotObserver.disconnect();
		window.removeEventListener( 'resize', onResize );
		setBodyPad( 0 );
	};
}
