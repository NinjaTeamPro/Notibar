/**
 * Theme-compat: Divi / Divi Child Theme for CDW Studios.
 * Ported verbatim from legacy notibar.js supportDiviTheme().
 *
 * @since 3.0.0
 */

import { setStyles, hasAdminBar, barHeight } from './helpers';

/**
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyDivi( slot ) {
	const h = barHeight( slot );
	const adminOffset = hasAdminBar() ? 32 : 0;

	setTimeout( () => {
		setStyles( 'header#main-header', { top: h + adminOffset + 'px' } );
	}, 1000 );

	document.body.style.paddingTop = h + 'px';
	document.body.style.position = 'relative';

	const bar = slot.querySelector( '.njt-nofi-notification-bar' );
	const isVisible = bar && bar.offsetParent !== null;

	if ( hasAdminBar() ) {
		setStyles( '.et_pb_section_0_tb_header', { top: '32px' } );
		setStyles( '.et_pb_section_1_tb_header', { top: '62px' } );
		setStyles( '.et_pb_section_0_tb_header.et_pb_sticky--top', {
			top: isVisible ? '66px' : '32px',
		} );
		setStyles( '.et_pb_section_1_tb_header.et_pb_sticky--top', {
			top: isVisible ? '96px' : '62px',
		} );
	} else {
		setStyles( '.et_pb_section_0_tb_header', { top: '0px' } );
		setStyles( '.et_pb_section_1_tb_header', { top: '30px' } );
		setStyles( '.et_pb_section_0_tb_header.et_pb_sticky--top', {
			top: isVisible ? '34px' : '0px',
		} );
		setStyles( '.et_pb_section_1_tb_header.et_pb_sticky--top', {
			top: isVisible ? '64px' : '30px',
		} );
	}
}
