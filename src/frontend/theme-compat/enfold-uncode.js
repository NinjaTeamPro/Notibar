/**
 * Theme-compat: Enfold + Uncode.
 * Ported verbatim from legacy notibar.js supportEnfoldTheme() / supportUncodeTheme().
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { setStyles, hasAdminBar, barHeight } from './helpers';

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

	const h = barHeight( slot );

	setTimeout( () => {
		const header = document.querySelector(
			'body header.av_header_border_disabled'
		);
		if (
			header &&
			! header.classList.contains( 'av_header_transparency' )
		) {
			header.style.top = hasAdminBar() ? '32px' : '0';
		}
	}, 500 );

	window.addEventListener( 'wheel', function ( event ) {
		if ( event.deltaY > 0 ) {
			setStyles( 'body header.av_header_border_disabled', {
				top: hasAdminBar() ? '32px' : '0',
			} );
		} else {
			const hasTransp = !! document.querySelector(
				'header.av_header_transparency'
			);
			if ( hasAdminBar() ) {
				setStyles( 'body header.av_header_border_disabled', {
					top: ( hasTransp ? 32 + h : 32 ) + 'px',
				} );
			} else {
				setStyles( 'body header.av_header_border_disabled', {
					top: hasTransp ? h + 'px' : '0',
				} );
			}
		}
	} );
}

/**
 * Uncode — body padding-top delay hack.
 *
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyUncode( slot ) {
	const h = barHeight( slot );

	setTimeout( () => {
		document.body.style.paddingTop = h + 'px';
	}, 1500 );

	window.addEventListener( 'wheel', function () {
		setTimeout( () => {
			document.body.style.paddingTop = h + 'px';
		}, 1000 );
	} );
}
