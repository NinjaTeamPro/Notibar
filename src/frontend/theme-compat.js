/**
 * Notibar — Theme-compatibility registry.
 *
 * Dispatches the correct theme-compat callback for the active theme.
 * Each callback receives the #njt-notibar-slot element and patches
 * header/nav positioning to accommodate the notification bar.
 *
 * Legacy theme hacks retained per resolved decision #6:
 *   Divi, Essentials, Nayma, Konte, Enfold,
 *   Uptime Child, Themify Ultra, Salient, Radiate Child,
 *   AccessPress Parallax Pro Child.
 * The Uncode shim was removed: it only wrote body padding-top, which is now
 * owned exclusively by installBodyPush() (whose !important inline write wins
 * over the shim's plain write anyway).
 *
 * A callback may return a sync() function — the dispatcher re-runs it on
 * slot childList mutations so placement-dependent offsets stay correct when
 * rotation swaps in a bar with a different placement, or dismiss empties
 * the slot.
 *
 * Shared by the frontend AND customizer-preview bundles — keep shims free
 * of heavy imports or they bloat both.
 *
 * Registry keys are theme display Names (e.g. "Divi", "Salient") to match
 * legacy v2.1.9 1:1. PHP passes wp_get_theme()->get('Name') as ctx.theme.
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { positionedEl } from './theme-compat/helpers';
import { applyBrandy } from './theme-compat/brandy';
import { applyDivi } from './theme-compat/divi';
import { applyEssentials } from './theme-compat/essentials';
import { applyNayma, applyKonte } from './theme-compat/nayma-konte';
import { applyEnfold } from './theme-compat/enfold-uncode';
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
 * @type {Object.<string, function(HTMLElement): (Function|void)>}
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
	// 7. Uptime Child
	'Uptime Child': applyUptimeChild,
	// 8. Themify Ultra
	'Themify Ultra': applyThemifyUltra,
	// 9. Salient
	Salient: applySalient,
	// 10. Radiate Child
	'Radiate Child': applyRadiateChild,
	// 11. AccessPress Parallax Pro Child
	'AccessPress Parallax Pro Child': applyAccessPressParallax,
	// 12. Brandy (YayCommerce FSE theme) — v3.1.5+
	Brandy: applyBrandy,
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
	if ( typeof fix !== 'function' ) {
		return;
	}
	const sync = fix( slot );
	if (
		typeof sync !== 'function' ||
		typeof MutationObserver === 'undefined'
	) {
		return;
	}
	// Rotation and dismiss both swap the slot's direct children; re-syncing
	// there keeps one-shot offsets correct for mixed top/bottom placements.
	// No subtree — deep mutations (e.g. content edits) can't change placement
	// and would only fire redundant syncs.
	new MutationObserver( sync ).observe( slot, { childList: true } );

	// The admin bar flips 32↔46px at the 782px breakpoint (and bar height
	// can change at responsive breakpoints) with no DOM mutation — re-sync
	// on resize so measured offsets stay current.
	window.addEventListener( 'resize', sync, { passive: true } );

	// Absolute bars scroll out of the viewport, flipping hasTopBar() with
	// no DOM mutation — re-sync on scroll, but only for absolute bars so
	// fixed bars (the common case) pay one attribute read per tick at most.
	// Read the POSITIONED element (the stack wrapper in stack mode, else the
	// container): in stack mode the inner container's data-position reflects the
	// ignored per-bar positionType, while the wrapper carries the authoritative
	// stackPositionType — so an absolute stack with fixed-positioned bars still
	// re-syncs on scroll and the header returns flush once the stack scrolls away.
	window.addEventListener(
		'scroll',
		function () {
			const el = positionedEl( slot );
			if ( el && 'absolute' === el.getAttribute( 'data-position' ) ) {
				sync();
			}
		},
		{ passive: true }
	);
}
