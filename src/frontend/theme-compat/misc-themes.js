/**
 * Theme-compat: Uptime Child, Themify Ultra, Salient,
 *               Radiate Child, AccessPress Parallax Pro Child.
 *
 * Ported from legacy notibar.js, made placement-aware: header offsets only
 * apply while a visible TOP-placed bar is active (hasTopBar); otherwise
 * offsets reset to theme-native values. Body padding is owned exclusively
 * by installBodyPush().
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import {
	setStyles,
	setStylesAll,
	hasAdminBar,
	hasTopBar,
	barHeight,
	adminBarHeight,
	positionedEl,
} from './helpers';

/**
 * Uptime Child — navbar top offset on wheel scroll.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyUptimeChild( slot ) {
	const positioned = positionedEl( slot );
	if ( ! positioned || getComputedStyle( positioned ).position !== 'fixed' ) {
		return;
	}

	window.addEventListener( 'wheel', function ( event ) {
		// 0 when bottom-placed/dismissed → resets navbar to native position.
		const h = hasTopBar( slot ) ? barHeight( slot ) : 0;
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
	window.addEventListener( 'wheel', function () {
		// Legacy used 56 with admin bar (32px bar + 24px theme padding) and
		// 32 without — computed per event so the admin-bar component tracks
		// the responsive 32↔46 flip.
		const offset = hasAdminBar() ? adminBarHeight() + 24 : 32;
		if ( hasTopBar( slot ) ) {
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
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applySalient( slot ) {
	function sync() {
		// Empty string clears the inline override → theme-native position.
		setStyles( 'header#top', {
			top: hasTopBar( slot ) ? barHeight( slot ) + 'px' : '',
		} );
	}

	sync();

	return sync;
}

/**
 * Radiate Child — .header-wrap top offset.
 *
 * @param {HTMLElement} slot
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applyRadiateChild( slot ) {
	function sync() {
		if ( ! hasTopBar( slot ) ) {
			setStyles( 'body .header-wrap', { top: '' } );
			return;
		}
		const paddingOffset = barHeight( slot ) + adminBarHeight();
		setStyles( 'body .header-wrap', { top: paddingOffset + 'px' } );
	}

	setTimeout( sync, 100 );
	window.addEventListener( 'wheel', sync );

	return sync;
}

/**
 * AccessPress Parallax Pro Child — masthead + menu-fix top offsets.
 *
 * @param {HTMLElement} slot
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applyAccessPressParallax( slot ) {
	function sync() {
		if ( ! hasTopBar( slot ) ) {
			setStyles( 'header#masthead', { top: '' } );
			setStyles( '#main-header.menu-fix', { top: '' } );
			return;
		}
		const h = barHeight( slot );
		setStyles( 'header#masthead', {
			top: h + adminBarHeight() + 'px',
		} );
	}

	setTimeout( sync, 100 );

	let lastScrollTop = 0;
	window.addEventListener( 'scroll', function () {
		if ( ! hasTopBar( slot ) ) {
			return;
		}
		const st = window.scrollY || document.documentElement.scrollTop;
		if ( st >= lastScrollTop ) {
			setStyles( '#main-header.menu-fix', {
				top: barHeight( slot ) + 'px',
			} );
		}
		lastScrollTop = st;
	} );

	return sync;
}
