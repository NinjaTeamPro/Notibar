/**
 * Theme-compat: Essentials.
 * Ported verbatim from legacy notibar.js supportEssentialsTheme().
 *
 * @since 3.0.0
 */

import { setStyles, hasAdminBar, barHeight } from './helpers';

/**
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyEssentials( slot ) {
	window.addEventListener( 'scroll', function () {
		const h = barHeight( slot );
		if ( hasAdminBar() ) {
			setStyles( 'body.admin-bar #masthead.pix-header', { top: '0' } );
			setStyles( 'body.admin-bar #masthead.pix-header.is-scroll', {
				top: h + 32 + 'px',
			} );
		} else {
			setStyles( 'body #masthead.pix-header', { top: '0' } );
			setStyles( 'body #masthead.pix-header.is-scroll', {
				top: h + 'px',
			} );
		}
	} );
}
