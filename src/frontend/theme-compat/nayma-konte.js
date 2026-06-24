/**
 * Theme-compat: Nayma + Konte.
 * Ported verbatim from legacy notibar.js supportNaymaTheme() / supportKonteTheme().
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import {
	setStyles,
	hasAdminBar,
	hasTopBar,
	barHeight,
	adminBarHeight,
	positionedEl,
} from './helpers';

/**
 * Nayma — fixed-header scroll offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyNayma( slot ) {
	const positioned = positionedEl( slot );
	if ( ! positioned || getComputedStyle( positioned ).position !== 'fixed' ) {
		return;
	}

	window.addEventListener( 'wheel', function ( event ) {
		// 0 when bottom-placed/dismissed → native header position.
		let h = hasTopBar( slot ) ? barHeight( slot ) : 0;
		// v3: collapsed state lives on .njt-nofi-container-content via
		// .njt-nofi-collapsed (was .njt-nofi-toggle-close on the bar in v2).
		const content = slot.querySelector( '.njt-nofi-container-content' );
		if ( content && content.classList.contains( 'njt-nofi-collapsed' ) ) {
			h = 0;
		}

		if ( event.deltaY < 0 ) {
			setStyles( 'body header .fixed-header', {
				top: h + adminBarHeight() + 'px',
			} );
		}
	} );
}

/**
 * Konte — sticky header scroll offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyKonte( slot ) {
	const positioned = positionedEl( slot );
	if ( ! positioned || getComputedStyle( positioned ).position !== 'fixed' ) {
		return;
	}

	window.addEventListener( 'wheel', function ( event ) {
		// Bottom-placed bars take the same path as dismissed ones: the
		// sticky header keeps its theme-native top.
		if ( ! hasTopBar( slot ) ) {
			const isSticky = !! document.querySelector(
				'body header#masthead.header-sticky--normal.sticky'
			);
			setStyles( 'body header#masthead.header-sticky--normal', {
				top: isSticky ? adminBarHeight() + 'px' : '0',
			} );
			return;
		}

		const h = barHeight( slot );
		if ( event.deltaY < 0 ) {
			setStyles( 'body header#masthead.header-sticky--normal.sticky', {
				top: h + adminBarHeight() + 'px',
			} );
		} else if ( hasAdminBar() ) {
			const isSticky = !! document.querySelector(
				'body header#masthead.header-sticky--normal.sticky'
			);
			setStyles( 'body header#masthead.header-sticky--normal', {
				top: ( isSticky ? h + adminBarHeight() : h ) + 'px',
			} );
		} else {
			setStyles( 'body header#masthead.header-sticky--normal.sticky', {
				top: h + 'px',
			} );
		}
	} );
}
