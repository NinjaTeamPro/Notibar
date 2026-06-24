/**
 * Mobile admin-bar offset — keep a FIXED top bar correctly positioned on
 * viewports ≤600px when the WP admin bar is present.
 *
 * WP core makes #wpadminbar position:absolute below 600px, so it scrolls
 * away with the document while the bar's static CSS offset (top:46px from
 * notibar.css) would leave a dead gap. This module clamps the fixed bar's
 * inline top to max(0, adminBarHeight - scrollY):
 *   - at scroll 0 → 46px (below the admin bar, no overlap)
 *   - scrolled past the admin bar → 0 (flush with the viewport top)
 *
 * Writes inline `top` on the plugin's OWN container only — no third-party
 * style race. Above 600px (admin bar fixed) the inline value is removed so
 * the stylesheet offsets (32/46px) apply untouched. Bottom-placed and
 * absolute-positioned bars are never touched (their offsets stay correct:
 * absolute bars scroll away together with the absolute admin bar).
 *
 * @since 3.0.0
 */
/* eslint-env browser */

// WP core's #wpadminbar position:absolute breakpoint.
const MOBILE_QUERY = '(max-width: 600px)';

/**
 * Install the scroll/resize clamp on a Notibar slot element.
 *
 * No-ops (returns immediately) when the page has no admin bar.
 *
 * @param {HTMLElement} slot The #njt-notibar-slot element.
 * @return {void}
 */
export function installMobileAdminBarOffset( slot ) {
	const adminBar = document.getElementById( 'wpadminbar' );
	if ( ! slot || ! adminBar ) {
		return;
	}

	const mq = window.matchMedia( MOBILE_QUERY );

	function findFixedTopBar() {
		// Stack mode (Pro): clamp the fixed top stack wrapper. An absolute stack
		// scrolls away with the document (like an absolute single bar) so it is
		// never clamped. The wrapper selector is inert in Lite — no stack exists.
		const stack = slot.querySelector(
			".njt-nofi-stack[data-placement='top'][data-position='fixed']"
		);
		if ( stack ) {
			return stack;
		}
		const bar = slot.querySelector(
			".njt-nofi-container[data-position='fixed']"
		);
		if ( ! bar || 'bottom' === bar.getAttribute( 'data-placement' ) ) {
			return null;
		}
		return bar;
	}

	function sync() {
		const bar = findFixedTopBar();
		if ( ! bar ) {
			return;
		}
		if ( ! mq.matches ) {
			// Desktop/tablet: admin bar is fixed — stylesheet offsets apply.
			bar.style.removeProperty( 'top' );
			return;
		}
		// scrollY goes negative during iOS rubber-band overscroll — clamp it
		// or the bar would briefly sink below the admin bar.
		const scrolled = Math.max( 0, window.scrollY );
		const top = Math.max( 0, adminBar.offsetHeight - scrolled );
		bar.style.setProperty( 'top', top + 'px' );
	}

	window.addEventListener( 'scroll', sync, { passive: true } );
	window.addEventListener( 'resize', sync, { passive: true } );

	// Rotation/dismiss swap the bar element — fresh elements need a sync
	// (and a scroll-restored load can start mid-page).
	new MutationObserver( sync ).observe( slot, { childList: true } );
	sync();
}
