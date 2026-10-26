/**
 * Theme-compat: Divi / Divi Child Theme for CDW Studios.
 * Ported from legacy notibar.js supportDiviTheme(), made placement-aware:
 * header offsets only apply for a visible top-placed bar. Body padding is
 * owned exclusively by installBodyPush().
 *
 * Admin-bar offset is measured live (32px desktop / 46px ≤782px) — the old
 * hardcoded 32 left the header 14px short on mobile. Theme Builder section
 * offsets derive from the same measurement plus Divi's own 30px stacking
 * gap (legacy literals 32/62/66/96 assumed a 32px admin bar + 34px bar).
 *
 * Secondary menu bar (#top-header): with fixed navigation it is pinned at the
 * admin bar above #main-header (fixed >980px, absolute ≤980px) and outranks
 * the bar's z-index, so it would cover the bar. There the whole header stack
 * is shifted down by the bar height with margin-top instead of `top`: Divi
 * keeps sole ownership of `top` on both elements — its per-breakpoint rules
 * (incl. the ≤980px `!important` ones of a menu-only secondary bar) and its
 * inline admin-bar + #top-header write — so the stack keeps its native
 * spacing when collapsed, and moves as one unit when expanded.
 *
 * @since 3.0.0
 */

import { setStyles, hasTopBar, barHeight, adminBarHeight } from './helpers';

/**
 * True when Divi's secondary menu bar is pinned (fixed/absolute) above
 * #main-header. Vertical and non-fixed navs render it in flow, where body
 * padding already moves it.
 *
 * @return {boolean} True when #top-header is fixed or absolute.
 */
function hasPinnedSecondaryBar() {
	const topHeader = document.getElementById( 'top-header' );
	if ( ! topHeader ) {
		return false;
	}
	const position = window.getComputedStyle( topHeader ).position;
	return 'fixed' === position || 'absolute' === position;
}

/**
 * @param {HTMLElement} slot
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applyDivi( slot ) {
	// Which offset mechanism the last sync wrote ('top' | 'stack'), so a switch
	// (Divi's Customizer toggling fixed/vertical nav live) undoes the other
	// one's writes instead of stacking both offsets.
	let mode = '';

	function sync() {
		const topBar = hasTopBar( slot );
		const h = topBar ? barHeight( slot ) : 0;
		const adminOffset = adminBarHeight();

		const next = hasPinnedSecondaryBar() ? 'stack' : 'top';
		if ( next !== mode ) {
			if ( 'top' === mode ) {
				setStyles( 'header#main-header', { top: '' } );
			} else if ( 'stack' === mode ) {
				setStyles( '#top-header', { marginTop: '' } );
				setStyles( 'header#main-header', { marginTop: '' } );
			}
			mode = next;
		}

		if ( 'stack' === mode ) {
			const shift = topBar ? h + 'px' : '';
			setStyles( '#top-header', { marginTop: shift } );
			setStyles( 'header#main-header', { marginTop: shift } );
		} else {
			// Empty string clears the inline override so Divi's own stylesheet
			// position applies when no top bar is active (bottom placement,
			// dismissed, or rotated out).
			setStyles( 'header#main-header', {
				top: topBar ? h + adminOffset + 'px' : '',
			} );
		}

		// Theme Builder header sections: section_0 sits below the admin bar
		// (plus the bar in sticky mode); section_1 stacks 30px (Divi's own
		// gap) below section_0.
		const base = adminOffset;
		const sticky = adminOffset + ( topBar ? h : 0 );
		setStyles( '.et_pb_section_0_tb_header', { top: base + 'px' } );
		setStyles( '.et_pb_section_1_tb_header', { top: base + 30 + 'px' } );
		setStyles( '.et_pb_section_0_tb_header.et_pb_sticky--top', {
			top: sticky + 'px',
		} );
		setStyles( '.et_pb_section_1_tb_header.et_pb_sticky--top', {
			top: sticky + 30 + 'px',
		} );
	}

	// Delay the first pass so Divi's own header JS has positioned things.
	setTimeout( sync, 100 );

	return sync;
}
