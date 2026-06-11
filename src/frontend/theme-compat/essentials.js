/**
 * Theme-compat: Essentials (pixfort).
 *
 * CSS-margin approach (replaces the legacy per-scroll inline `top` writes):
 * pixfort-core's header JS re-writes the sticky header's inline `top` on
 * every scroll tick, so competing inline `top` writes are a script-order
 * race. Instead we own a single <style> rule that adds `margin-top` — a
 * property pixfort never writes and whose value its sticky accumulator
 * reads back (`a += el.marginTop`), so the offsets compose additively.
 *
 * NO admin-bar offset here: pixfort already folds #wpadminbar height into
 * its inline `top` computation (viewport >600px).
 *
 * Selector notes (verified against yaycommerce.com):
 * - `.pix-header.is-scroll` — class pixfort adds when a `.is-sticky` /
 *   `.is-smart-sticky` header goes fixed; covers BOTH #masthead and a
 *   sticky-configured #mobile_head (both carry .pix-header).
 * - `.pix-header.pix-mobile-sticky` — the theme's CSS-only always-sticky
 *   mobile mode, which never receives `is-scroll`.
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { makeBarOffsetStyleSync } from './helpers';

/**
 * @param {HTMLElement} slot
 * @return {Function} sync callback — dispatcher re-runs it on bar swaps.
 */
export function applyEssentials( slot ) {
	const sync = makeBarOffsetStyleSync(
		slot,
		'njt-nofi-essentials-compat',
		( h ) => `.pix-header.is-scroll,
.pix-header.pix-mobile-sticky { margin-top: ${ h }px !important; }`
	);

	// Delay the first pass so pixfort's header JS has positioned things.
	setTimeout( sync, 100 );

	return sync;
}
