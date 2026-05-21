/**
 * Theme-compat: Nayma + Konte.
 * Ported verbatim from legacy notibar.js supportNaymaTheme() / supportKonteTheme().
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { setStyles, hasAdminBar, barHeight, isSlotHidden } from './helpers';

/**
 * Nayma — fixed-header scroll offset.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyNayma( slot ) {
	const container = slot.querySelector( '.njt-nofi-container' );
	if ( ! container || getComputedStyle( container ).position !== 'fixed' ) {
		return;
	}

	window.addEventListener( 'wheel', function ( event ) {
		let h = barHeight( slot );
		// v3: collapsed state lives on .njt-nofi-container-content via
		// .njt-nofi-collapsed (was .njt-nofi-toggle-close on the bar in v2).
		const content = slot.querySelector( '.njt-nofi-container-content' );
		if ( content && content.classList.contains( 'njt-nofi-collapsed' ) ) {
			h = 0;
		}

		if ( event.deltaY < 0 ) {
			if ( hasAdminBar() ) {
				setStyles( 'body header .fixed-header', {
					top: h + 32 + 'px',
				} );
			} else {
				setStyles( 'body header .fixed-header', { top: h + 'px' } );
			}
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
	const container = slot.querySelector( '.njt-nofi-container' );
	if ( ! container || getComputedStyle( container ).position !== 'fixed' ) {
		return;
	}

	window.addEventListener( 'wheel', function ( event ) {
		const h = barHeight( slot );
		const dismissed = isSlotHidden( slot );

		if ( dismissed ) {
			if ( hasAdminBar() ) {
				const isSticky = !! document.querySelector(
					'body header#masthead.header-sticky--normal.sticky'
				);
				setStyles( 'body header#masthead.header-sticky--normal', {
					top: isSticky ? '32px' : '0',
				} );
			} else {
				setStyles( 'body header#masthead.header-sticky--normal', {
					top: '0',
				} );
			}
		} else if ( event.deltaY < 0 ) {
			setStyles( 'body header#masthead.header-sticky--normal.sticky', {
				top: ( hasAdminBar() ? h + 32 : h ) + 'px',
			} );
		} else if ( hasAdminBar() ) {
			const isSticky = !! document.querySelector(
				'body header#masthead.header-sticky--normal.sticky'
			);
			setStyles( 'body header#masthead.header-sticky--normal', {
				top: ( isSticky ? h + 32 : h ) + 'px',
			} );
		} else {
			setStyles( 'body header#masthead.header-sticky--normal.sticky', {
				top: h + 'px',
			} );
		}
	} );
}
