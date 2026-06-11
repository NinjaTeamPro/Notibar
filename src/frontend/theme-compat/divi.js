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
 * @since 3.0.0
 */

import { setStyles, hasTopBar, barHeight, adminBarHeight } from './helpers';

/**
 * @param {HTMLElement} slot
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applyDivi( slot ) {
	function sync() {
		const topBar = hasTopBar( slot );
		const h = topBar ? barHeight( slot ) : 0;
		const adminOffset = adminBarHeight();

		// Empty string clears the inline override so Divi's own stylesheet
		// position applies when no top bar is active (bottom placement,
		// dismissed, or rotated out).
		setStyles( 'header#main-header', {
			top: topBar ? h + adminOffset + 'px' : '',
		} );

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
