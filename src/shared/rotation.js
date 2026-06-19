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

import { injectNavControls } from './nav-controls';

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
 * @param {boolean}     [options.autoplay]    Defaults true; false starts the
 *                                            cycle without the auto-advance
 *                                            timer (manual arrows/keys only).
 *
 * @return {{ stop: Function, next: Function, prev: Function }} Control handle.
 *         stop() before re-rendering; next()/prev() step bars manually.
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

export function startRotation( {
	slot,
	bars,
	renderFn,
	global,
	intervalSec,
	autoplay,
} ) {
	let index = 0;
	let paused = false;
	let timerId = null;

	const delay = ( intervalSec || global.rotationIntervalSeconds || 5 ) * 1000;
	const pauseOnHover = global.rotationPauseOnHover !== false;
	// Autoplay defaults on; callers pass autoplay:false to honour
	// prefers-reduced-motion (arrows still work, just no auto-advance).
	const useAutoplay = autoplay !== false;
	// Arrows: enabled by default, only meaningful with more than one bar.
	// Neutral identifier keeps the Lite-strip "zero rotation" invariant intact.
	const showArrows = global.rotationShowArrows !== false && bars.length > 1;

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

	// Render bar at `i`, reveal it, then (re)inject the nav arrows. Arrows are
	// re-applied after every swap because slot.innerHTML replaces the whole
	// container-content; clicks are delegated upstream so re-injection leaks
	// no listeners. The innerHTML swap replaces .njt-nofi-container, so
	// body-push correctly re-attaches to the new bar. The subsequent arrow
	// injection mutates inside that same .njt-nofi-container, so body-push's
	// re-attach guard no-ops on it, and absolutely-positioned arrows don't
	// change container height — so the ResizeObserver stays quiet too.
	// `dir` ('next' | 'prev' | undefined): set only for manual navigation, where
	// it tags the container-content so CSS plays a horizontal carousel slide in
	// that direction. Initial render + auto-advance pass no dir → the existing
	// vertical slide-down entrance.
	function render( i, dir ) {
		index = i;
		slot.innerHTML = renderFn( bars[ index ], global );
		if ( dir ) {
			const cc = slot.querySelector( '.njt-nofi-container-content' );
			if ( cc ) {
				cc.classList.add(
					'prev' === dir
						? 'njt-nofi-nav-slide-prev'
						: 'njt-nofi-nav-slide-next'
				);
			}
		}
		revealNewBar();
		injectNavControls( slot, { showArrows } );
	}

	function resetTimer() {
		if ( timerId !== null ) {
			clearInterval( timerId );
			timerId = null;
		}
		if ( useAutoplay ) {
			timerId = setInterval( advance, delay );
		}
	}

	function advance() {
		if ( paused ) {
			return;
		}
		render( nextIndex( index, bars.length, global.rotationOrder ) );
	}

	// Manual navigation is always sequential cyclic (wraps), independent of
	// global.rotationOrder — random prev/next would be meaningless for a user.
	// Each manual move resets the autoplay timer so the chosen bar is not
	// immediately advanced past.
	function goTo( i, dir ) {
		render( ( i + bars.length ) % bars.length, dir );
		resetTimer();
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

	// Initial render (caller may have already painted the first bar; this keeps
	// the controller authoritative and ensures arrows are injected).
	render( 0 );

	resetTimer();

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
		next() {
			goTo( index + 1, 'next' );
		},
		prev() {
			goTo( index - 1, 'prev' );
		},
	};
}
