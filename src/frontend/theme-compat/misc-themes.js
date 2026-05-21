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

import {
	setStyles,
	setStylesAll,
	hasAdminBar,
	barHeight,
	isSlotHidden,
} from './helpers';

/**
 * Uptime Child — navbar top offset on wheel scroll.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyUptimeChild( slot ) {
	const container = slot.querySelector( '.njt-nofi-container' );
	if ( ! container || getComputedStyle( container ).position !== 'fixed' ) {
		return;
	}

	const h = barHeight( slot );

	window.addEventListener( 'wheel', function ( event ) {
		if ( isSlotHidden( slot ) ) {
			return;
		}
		if ( event.deltaY < 0 ) {
			setStyles( '.navbar.scrolled', { top: h + 'px' } );
		} else {
			setStyles( '.navbar', { top: '0' } );
			setStyles( '.navbar.scrolled', { top: h + 'px' } );
		}
	} );
}

/**
 * Themify Ultra — headerwrap top on wheel scroll.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyThemifyUltra( slot ) {
	const bar = slot.querySelector( '.njt-nofi-notification-bar' );
	const isBarVisible = bar && bar.offsetParent !== null;
	const offset = hasAdminBar() ? 56 : 32;

	window.addEventListener( 'wheel', function () {
		if ( isBarVisible ) {
			setStylesAll(
				'#headerwrap.tf_box.tf_w, #headerwrap.tf_box.tf_w.fixed-header',
				{ top: offset + 'px' }
			);
		} else {
			setStyles( '#headerwrap', { top: '0px' } );
		}
	} );
}

/**
 * Salient — header#top top offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applySalient( slot ) {
	const bar = slot.querySelector( '.njt-nofi-notification-bar' );
	if ( bar && bar.offsetParent !== null ) {
		setStyles( 'header#top', { top: barHeight( slot ) + 'px' } );
	}
}

/**
 * Radiate Child — .header-wrap top offset + body padding reset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyRadiateChild( slot ) {
	const h = barHeight( slot );
	const paddingOffset = h + ( hasAdminBar() ? 32 : 0 );

	setTimeout( () => {
		setStyles( 'body .header-wrap', { top: paddingOffset + 'px' } );
		document.body.style.paddingTop = '0';
	}, 1000 );

	window.addEventListener( 'wheel', function () {
		setStyles( 'body .header-wrap', { top: paddingOffset + 'px' } );
	} );
}

/**
 * AccessPress Parallax Pro Child — masthead + menu-fix top offsets.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyAccessPressParallax( slot ) {
	const h = barHeight( slot );

	setTimeout( () => {
		setStyles( 'header#masthead', {
			top: ( hasAdminBar() ? h + 32 : h ) + 'px',
		} );
	}, 1000 );

	let lastScrollTop = 0;
	window.addEventListener( 'scroll', function () {
		if ( isSlotHidden( slot ) ) {
			return;
		}
		const st = window.scrollY || document.documentElement.scrollTop;
		if ( st >= lastScrollTop ) {
			setStyles( '#main-header.menu-fix', { top: h + 'px' } );
		}
		lastScrollTop = st;
	} );
}
