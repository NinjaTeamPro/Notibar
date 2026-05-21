/**
 * Notibar — Theme-compatibility registry.
 *
 * Dispatches the correct theme-compat callback for the active theme.
 * Each callback receives the #njt-notibar-slot element and patches
 * header/nav positioning to accommodate the notification bar.
 *
 * All 11 legacy theme hacks are retained per resolved decision #6:
 *   Divi, Essentials, Nayma, Konte, Enfold, Uncode,
 *   Uptime Child, Themify Ultra, Salient, Radiate Child,
 *   AccessPress Parallax Pro Child.
 *
 * Registry keys are theme display Names (e.g. "Divi", "Salient") to match
 * legacy v2.1.9 1:1. PHP passes wp_get_theme()->get('Name') as ctx.theme.
 *
 * @since 3.0.0
 */

import { applyDivi } from './theme-compat/divi';
import { applyEssentials } from './theme-compat/essentials';
import { applyNayma, applyKonte } from './theme-compat/nayma-konte';
import { applyEnfold, applyUncode } from './theme-compat/enfold-uncode';
import {
	applyUptimeChild,
	applyThemifyUltra,
	applySalient,
	applyRadiateChild,
	applyAccessPressParallax,
} from './theme-compat/misc-themes';

/**
 * Map of theme stylesheet slug → compat callback.
 *
 * @type {Object.<string, function(HTMLElement): void>}
 */
const THEME_FIXES = {
	// 1. Divi
	Divi: applyDivi,
	// 2. Divi Child Theme for CDW Studios (same fixes as Divi)
	'Divi Child Theme for CDW Studios': applyDivi,
	// 3. Essentials
	Essentials: applyEssentials,
	// 4. Nayma
	Nayma: applyNayma,
	// 5. Konte
	Konte: applyKonte,
	// 6. Enfold
	Enfold: applyEnfold,
	// 7. Uncode
	Uncode: applyUncode,
	// 8. Uptime Child
	'Uptime Child': applyUptimeChild,
	// 9. Themify Ultra
	'Themify Ultra': applyThemifyUltra,
	// 10. Salient
	Salient: applySalient,
	// 11. Radiate Child
	'Radiate Child': applyRadiateChild,
	// 12. AccessPress Parallax Pro Child
	'AccessPress Parallax Pro Child': applyAccessPressParallax,
};

/**
 * Apply the theme-compatibility callback for the active theme, if one exists.
 *
 * Safe to call with an unknown theme slug — no-ops gracefully.
 *
 * @param {string}      themeSlug Active theme stylesheet slug (ctx.theme).
 * @param {HTMLElement} slot      The #njt-notibar-slot element.
 * @return {void}
 */
export function applyThemeCompat( themeSlug, slot ) {
	const fix = THEME_FIXES[ themeSlug ];
	if ( typeof fix === 'function' ) {
		fix( slot );
	}
}
