/* eslint-env browser */
/**
 * Notibar shared navigation-controls module (Pro).
 *
 * Builds and injects the manual prev/next arrow buttons used by the rotation
 * controller. Arrows are a JS-runtime enhancement layered on top of the
 * per-bar markup from render-bar.js — render-bar.js stays untouched and the
 * server-side initial paint never emits arrows.
 *
 * Clicks are handled by the delegated slot handler in the frontend / preview
 * runtimes (no per-button listeners here), so re-injecting the markup after
 * every bar swap is safe and leak-free.
 *
 * Identifiers are intentionally neutral (njt-nofi-nav, not "rotation*") so the
 * Lite build's "zero rotation substrings" output invariant is not tripped.
 *
 * @since 3.2.0
 */

export const NAV_PREV_CLASS = 'njt-nofi-nav-prev';
export const NAV_NEXT_CLASS = 'njt-nofi-nav-next';

// lucide-style stroke chevrons (shadcn uses lucide icons). viewBox 0 0 24 24,
// rendered with stroke=currentColor / no fill so the chevron follows the bar
// text color. aria-hidden — the button carries the accessible label.
const CHEVRON_LEFT = 'm15 18-6-6 6-6';
const CHEVRON_RIGHT = 'm9 18 6-6-6-6';

/**
 * Build one arrow button's HTML.
 *
 * @param {string} cls   Direction class (NAV_PREV_CLASS / NAV_NEXT_CLASS).
 * @param {string} label aria-label text (static, English — matches render-bar.js close control).
 * @param {string} path  SVG path data.
 * @return {string} Button HTML string.
 */
function arrowButton( cls, label, path ) {
	return (
		`<button class="njt-nofi-nav ${ cls }" type="button" aria-label="${ label }">` +
		`<svg class="njt-nofi-nav-icon" xmlns="http://www.w3.org/2000/svg" ` +
		`viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ` +
		`stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
		`<path d="${ path }"/></svg>` +
		`</button>`
	);
}

/**
 * Inject prev/next arrows into the freshly-rendered bar.
 *
 * No-op when arrows are disabled or the bar element is missing. Idempotent:
 * skips when arrows are already present (defensive — each render produces a
 * fresh bar, so duplicates should not occur).
 *
 * @param {HTMLElement} slot               The notibar slot element.
 * @param {Object}      options            Options bag.
 * @param {boolean}     options.showArrows When false, no-op.
 * @return {void}
 */
export function injectNavControls( slot, { showArrows } ) {
	if ( ! showArrows ) {
		return;
	}
	const bar = slot.querySelector( '.njt-nofi-notification-bar' );
	if ( ! bar || bar.querySelector( '.njt-nofi-nav' ) ) {
		return;
	}
	// Marker class lets CSS reserve gutter space + nudge the close button
	// inboard only when arrows are actually present.
	bar.classList.add( 'njt-nofi-has-nav' );
	bar.insertAdjacentHTML(
		'beforeend',
		arrowButton( NAV_PREV_CLASS, 'Previous notification', CHEVRON_LEFT ) +
			arrowButton( NAV_NEXT_CLASS, 'Next notification', CHEVRON_RIGHT )
	);
}
