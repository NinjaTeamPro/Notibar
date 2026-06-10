/**
 * Theme-compat: Divi / Divi Child Theme for CDW Studios.
 *
 * Requires .njt-nofi-container { z-index: 100001 } in notibar.css — Divi
 * #main-header uses z-index: 99999 and will cover the bar without it.
 * Body padding: shared/body-push.js only.
 *
 * @since 3.0.0
 */

import { setStyles, hasAdminBar, barHeight } from './helpers';

function desiredHeaderTopPx( slot ) {
	return barHeight( slot ) + ( hasAdminBar() ? 32 : 0 );
}

/** Push fixed Divi header below the bar (+ WP admin bar when logged in). */
function patchHeaderTop( slot ) {
	const header = document.querySelector( 'header#main-header' );
	if ( ! header ) {
		return;
	}
	const px = desiredHeaderTopPx( slot );
	const currentPx = parseFloat( getComputedStyle( header ).top ) || 0;
	if (
		Math.abs( currentPx - px ) < 0.5 &&
		header.style.getPropertyPriority( 'top' ) === 'important'
	) {
		return;
	}
	header.style.setProperty( 'top', px + 'px', 'important' );
}

/** Re-apply when Divi resets #main-header top after its own init. */
function watchHeaderTop( slot ) {
	const header = document.querySelector( 'header#main-header' );
	if ( ! header || typeof MutationObserver === 'undefined' ) {
		return;
	}
	new MutationObserver( () => patchHeaderTop( slot ) ).observe( header, {
		attributes: true,
		attributeFilter: [ 'style', 'class' ],
	} );
}

/**
 * @param {HTMLElement} slot
 * @return {void}
 */
export function applyDivi( slot ) {
	patchHeaderTop( slot );
	watchHeaderTop( slot );

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
