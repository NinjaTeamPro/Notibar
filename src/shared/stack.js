/**
 * Notibar shared stack module (Pro).
 *
 * Builds the "show all bars" layout: every surviving bar rendered at once,
 * split by per-bar placement into a top wrapper and a bottom wrapper. Reuses
 * render-bar.js untouched — each bar keeps its full-width markup; the wrapper
 * owns the positioning and the inner container pin is neutralized in CSS
 * (`.njt-nofi-stack .njt-nofi-container { position: static }`).
 *
 * One position type applies to the whole stack (global.stackPositionType,
 * fixed|absolute) — per-bar positionType is ignored in stack mode. The bottom
 * wrapper is visually reversed in CSS (flex-direction: column-reverse) so it
 * grows from the viewport bottom upward while DOM/tab order stays list order.
 *
 * Pure function: bars + global → HTML string. No DOM reads, no side-effects.
 *
 * Stripped from the Lite build (see build-tools/pro-manifest.json). Every call
 * site is wrapped in @pro/@endpro so the Lite bundle never imports this.
 *
 * @since 3.2.0
 */

import { renderBarHTML } from './render-bar.js';

/**
 * Build one stack wrapper for a group of bars.
 *
 * @param {Array}    bars      Bars in this group (already filtered).
 * @param {string}   placement 'top' | 'bottom'.
 * @param {string}   position  'fixed' | 'absolute' (whole-stack position type).
 * @param {Object}   global    Global config (passed through to renderFn).
 * @param {Function} renderFn  Per-bar renderer (bar, global) → HTML string.
 * @return {string} Wrapper HTML, or '' when the group is empty.
 */
function buildWrapper( bars, placement, position, global, renderFn ) {
	if ( ! bars.length ) {
		return '';
	}
	const inner = bars.map( ( bar ) => renderFn( bar, global ) ).join( '' );
	return (
		`<div class="njt-nofi-stack" data-placement="${ placement }" ` +
		`data-position="${ position }">${ inner }</div>`
	);
}

/**
 * Build the full stack markup for all surviving bars.
 *
 * Bars split by their own style.placement: 'bottom' → bottom wrapper, everything
 * else → top wrapper. Top wrapper first in source order.
 *
 * @param {Array}    survivors                Filtered bars to display.
 * @param {Object}   global                   Global config (reads stackPositionType).
 * @param {Function} [renderFn=renderBarHTML] Per-bar renderer — the frontend
 *                                            passes a collapsed-state-aware wrapper; the preview passes
 *                                            renderBarHTML directly.
 * @return {string} Concatenated top + bottom wrapper HTML.
 */
export function buildStacksHTML( survivors, global, renderFn = renderBarHTML ) {
	const position =
		global && global.stackPositionType === 'absolute'
			? 'absolute'
			: 'fixed';

	const topBars = survivors.filter(
		( bar ) => ! bar.style || bar.style.placement !== 'bottom'
	);
	const bottomBars = survivors.filter(
		( bar ) => bar.style && bar.style.placement === 'bottom'
	);

	return (
		buildWrapper( topBars, 'top', position, global, renderFn ) +
		buildWrapper( bottomBars, 'bottom', position, global, renderFn )
	);
}
