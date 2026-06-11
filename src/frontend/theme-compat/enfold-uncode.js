/**
 * Theme-compat: Enfold.
 * Ported from legacy notibar.js supportEnfoldTheme(), made placement-aware.
 *
 * The legacy Uncode shim (supportUncodeTheme) was removed: it only wrote
 * body padding-top, which is owned exclusively by installBodyPush().
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { setStyles, hasTopBar, barHeight, adminBarHeight } from './helpers';

/**
 * Enfold — absolute-position header offset with transparency check.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyEnfold( slot ) {
	const container = slot.querySelector( '.njt-nofi-container' );
	if (
		! container ||
		getComputedStyle( container ).position !== 'absolute'
	) {
		return;
	}

	setTimeout( () => {
		const header = document.querySelector(
			'body header.av_header_border_disabled'
		);
		if (
			header &&
			! header.classList.contains( 'av_header_transparency' )
		) {
			header.style.top = adminBarHeight() + 'px';
		}
	}, 500 );

	window.addEventListener( 'wheel', function ( event ) {
		// Placement/height re-read per event — rotation can swap bars.
		// Downward scroll, bottom placement, and dismissed all resolve to
		// the theme-native header position (admin-bar offset only).
		if ( event.deltaY > 0 || ! hasTopBar( slot ) ) {
			setStyles( 'body header.av_header_border_disabled', {
				top: adminBarHeight() + 'px',
			} );
			return;
		}

		const hasTransp = !! document.querySelector(
			'header.av_header_transparency'
		);
		setStyles( 'body header.av_header_border_disabled', {
			top:
				adminBarHeight() + ( hasTransp ? barHeight( slot ) : 0 ) + 'px',
		} );
	} );
}
