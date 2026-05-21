/* eslint-env browser */
/**
 * Notibar shared rotation module.
 *
 * Drives multi-bar rotation in both the Customizer preview and the
 * frontend runtime (phase 07). Returns a cleanup handle so callers
 * can stop the rotation before starting a new one (no interval leaks).
 *
 * Features:
 *  - configurable interval (rotationIntervalSeconds)
 *  - pause-on-hover via mouseenter / mouseleave on the slot element
 *  - pause when tab is hidden via Page Visibility API
 *
 * @since 3.0.0
 */

// eslint-disable-next-line jsdoc/check-line-alignment
/**
 * Start a rotation cycle on the given slot element.
 *
 * @param {Object}      options               Options bag.
 * @param {HTMLElement} options.slot          Container element to swap innerHTML on.
 * @param {Object[]}    options.bars          Pre-filtered array of bar objects (min 2).
 * @param {Function}    options.renderFn      renderBarHTML(bar, global) function.
 * @param {Object}      options.global        Global config object.
 * @param {number}      [options.intervalSec] Override rotationIntervalSeconds.
 *
 * @return {{ stop: Function }} Cleanup handle. Call stop() before re-rendering.
 */
/**
 * Compute the next bar index based on rotation order setting.
 *
 * - 'sequential' (default): cyclic +1.
 * - 'random': uniform random over indices excluding the current one
 *   (so the bar always visibly changes on every tick).
 *
 * @param {number} current Current bar index.
 * @param {number} count   Total bars (≥1).
 * @param {string} [order] 'sequential' (default) or 'random'.
 * @return {number} Next index.
 */
export function nextIndex( current, count, order ) {
	if ( count <= 1 ) {
		return 0;
	}
	if ( 'random' === order ) {
		// Pick uniformly from [0..count-1] excluding `current`.
		const r = Math.floor( Math.random() * ( count - 1 ) );
		return r >= current ? r + 1 : r;
	}
	return ( current + 1 ) % count;
}

export function startRotation( { slot, bars, renderFn, global, intervalSec } ) {
	let index = 0;
	let paused = false;
	let timerId = null;

	const delay = ( intervalSec || global.rotationIntervalSeconds || 5 ) * 1000;
	const pauseOnHover = global.rotationPauseOnHover !== false;

	function revealNewBar() {
		const containerContent = slot.querySelector(
			'.njt-nofi-container-content'
		);
		if ( ! containerContent ) {
			return;
		}
		// Adding the class triggers the @keyframes slide-in animation in
		// notibar.css. Keyframes play unconditionally — no reflow trick
		// needed (unlike CSS transitions which require detected change).
		containerContent.classList.add( 'njt-nofi-visible' );
	}

	function advance() {
		if ( paused ) {
			return;
		}
		index = nextIndex( index, bars.length, global.rotationOrder );
		slot.innerHTML = renderFn( bars[ index ], global );
		revealNewBar();
	}

	function pause() {
		paused = true;
	}

	function resume() {
		paused = false;
	}

	function onVisibilityChange() {
		if ( document.hidden ) {
			pause();
		} else {
			resume();
		}
	}

	// Render first bar immediately (caller may have already done this).
	slot.innerHTML = renderFn( bars[ 0 ], global );
	revealNewBar();

	timerId = setInterval( advance, delay );

	if ( pauseOnHover ) {
		slot.addEventListener( 'mouseenter', pause );
		slot.addEventListener( 'mouseleave', resume );
	}

	document.addEventListener( 'visibilitychange', onVisibilityChange );

	return {
		stop() {
			if ( timerId !== null ) {
				clearInterval( timerId );
				timerId = null;
			}
			if ( pauseOnHover ) {
				slot.removeEventListener( 'mouseenter', pause );
				slot.removeEventListener( 'mouseleave', resume );
			}
			document.removeEventListener(
				'visibilitychange',
				onVisibilityChange
			);
		},
	};
}
