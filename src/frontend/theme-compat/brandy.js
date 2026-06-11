/**
 * Theme-compat: Brandy (YayCommerce FSE theme).
 *
 * Brandy's sticky header is positioned purely by CSS:
 *   .is-stickying .sticky-part { position: fixed; top: var(--wp-adminbar-height); }
 * (theme JS only toggles the is-stickying/is-hidden classes and inline width —
 * it never writes inline `top`, so a stylesheet override composes race-free).
 *
 * The override keeps the admin-bar var in the calc, so 0/32/46px responsive
 * admin-bar handling stays the theme's job; we add bar height only.
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { makeBarOffsetStyleSync } from './helpers';

/**
 * @param {HTMLElement} slot
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applyBrandy( slot ) {
	// The 0px fallback (absent in the theme's own rule) keeps the calc()
	// valid when the var is unset — resolving to bar height alone, which is
	// the correct no-admin-bar position. Do not remove it to "match" Brandy.
	const sync = makeBarOffsetStyleSync(
		slot,
		'njt-nofi-brandy-compat',
		( h ) =>
			`.is-stickying .sticky-part { top: calc(var(--wp-adminbar-height, 0px) + ${ h }px) !important; }`
	);

	sync();

	return sync;
}
