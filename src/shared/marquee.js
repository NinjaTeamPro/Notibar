/* eslint-env browser */
/**
 * Notibar shared marquee engine (Pro).
 *
 * Drives the scroll with the Web Animations API. CSS owns the structure — the
 * clipped viewport, the nowrap track, the scope sizing — but not the motion.
 *
 * Why not CSS: the travel distance is viewport-width + item-width, which no CSS
 * percentage can express — percentages resolve against the track's own width.
 * Generating per-bar @keyframes through CSSOM would work but needs unique
 * animation names, a managed <style> element and teardown on every render —
 * more moving parts than this for the same result. Loop mode runs here too, so
 * there is only ever one engine.
 *
 * Consequence: no JS means no motion. The content then sits at its natural
 * resting position, readable — a better failure mode than the previous
 * CSS-only fallback, which animated at the wrong speed from the wrong offset.
 *
 * Geometry, with W = item width, V = viewport width, S = px/sec, D = delay.
 * Both modes cover the same travel, W + V, in (W + V) / S seconds; they differ
 * only in phase — where the lap begins:
 *
 *   loop              starts off-screen
 *     left            translateX(+V) → translateX(-W)
 *     right           translateX(-W) → translateX(+V)
 *
 *   rest-then-scroll  starts at the resting position
 *     left            0 → -W ‖ +V → 0
 *     right           0 → +V ‖ -W → 0
 *
 * The ‖ is a deliberate discontinuity at a single offset. It is invisible: at
 * that instant the content has just cleared one edge and is about to enter from
 * the other, so nothing is on screen to jump.
 *
 * D is NOT part of the lap. It is the animation's own delay, which WAAPI runs
 * once before the first iteration, so the hold happens on first appearance and
 * never again — subsequent laps run straight through.
 *
 * Follows the countdown.js pattern: booted once per root, then self-healing. A
 * MutationObserver re-measures marquees injected by later renders (rotation
 * advance, dismiss re-render, stack, customizer preview redraw), so no render
 * call site has to know this module exists.
 *
 * Pro-only: removed from the Lite build via pro-manifest.json, and every import
 * + call site is wrapped in the Pro-only build markers.
 *
 * @since 3.2.0
 */

const WRAP_SEL = '.njt-nofi-marquee';
const TRACK_SEL = '.njt-nofi-marquee-track';
const RESIZE_DEBOUNCE_MS = 150;

// Mirrors Schema::sanitizeStyle's clamps. These attributes are DOM-readable,
// so they are re-clamped here rather than trusted.
const SPEED_MIN = 10;
const SPEED_MAX = 300;
const SPEED_FALLBACK = 60;
const DELAY_MIN = 0;
const DELAY_MAX = 10;

let rootEl = null;
let observer = null;
let resizeTimer = null;
let listenersBound = false;

/**
 * Clamp a DOM-supplied number.
 *
 * @param {*}      raw      Attribute value.
 * @param {number} min      Lower bound.
 * @param {number} max      Upper bound.
 * @param {number} fallback Used when the value is not a usable number.
 *
 * @return {number} Clamped value.
 */
function clamp( raw, min, max, fallback ) {
	const n = Number( raw );
	return Math.min(
		max,
		Math.max( min, Number.isFinite( n ) ? n : fallback )
	);
}

/**
 * Build the keyframe list for one marquee.
 *
 * Offsets are fractions of one lap. The hold is not represented here — it is
 * the animation's delay, applied once before the first lap.
 *
 * @param {string} mode 'loop' | 'rest-then-scroll'.
 * @param {string} dir  'left' | 'right'.
 * @param {number} w    Item width in px.
 * @param {number} v    Viewport width in px.
 *
 * @return {Array<Object>} Keyframes for Element.animate().
 */
function buildFrames( mode, dir, w, v ) {
	const left = dir !== 'right';

	if ( mode !== 'rest-then-scroll' ) {
		// Straight through, entering from the trailing edge.
		return left
			? [
					{ transform: `translateX(${ v }px)` },
					{ transform: `translateX(${ -w }px)` },
			  ]
			: [
					{ transform: `translateX(${ -w }px)` },
					{ transform: `translateX(${ v }px)` },
			  ];
	}

	// Same travel as loop, phase-shifted to begin and end at rest: scroll out,
	// teleport while off-screen, glide back in to the resting position. The
	// hold is NOT a keyframe segment — it is the animation's own delay, so it
	// happens once on first appearance rather than on every lap.
	//
	// Travelling left the out-leg is w and the return is v; going right it is
	// the other way round, so the departure lands at a different fraction.
	const outLeg = left ? w : v;
	const departed = outLeg / ( w + v );

	return [
		{ transform: 'translateX(0px)', offset: 0 },
		{
			transform: left ? `translateX(${ -w }px)` : `translateX(${ v }px)`,
			offset: departed,
		},
		{
			transform: left ? `translateX(${ v }px)` : `translateX(${ -w }px)`,
			offset: departed,
		},
		{ transform: 'translateX(0px)', offset: 1 },
	];
}

/**
 * Length of one lap. Travel is w + v in both modes; any hold is separate.
 *
 * @param {number} w     Item width in px.
 * @param {number} v     Viewport width in px.
 * @param {number} speed Scroll speed in px/sec.
 *
 * @return {number} Duration in seconds.
 */
function cycleSeconds( w, v, speed ) {
	return ( w + v ) / speed;
}

/**
 * Measure one marquee and (re)start its animation.
 *
 * @param {HTMLElement} wrap A .njt-nofi-marquee element.
 *
 * @return {void} Nothing.
 */
function measure( wrap ) {
	const track = wrap.querySelector( TRACK_SEL );
	if ( ! track || track.dataset.mqReady === '1' ) {
		return;
	}

	const item = track.firstElementChild;
	if ( ! item ) {
		return;
	}

	// Zero means the wrapper is hidden at this breakpoint (the mobile block on
	// a desktop viewport). Leave it unmeasured and unflagged so the resize pass
	// picks it up once it becomes visible.
	if ( ! item.offsetWidth || ! wrap.clientWidth ) {
		return;
	}

	const v = wrap.clientWidth;

	// Cancel first. The resize path clears mqReady and re-measures, so without
	// this each resize would stack another infinite animation on the element.
	cancelAnimations( track );

	if ( prefersReducedMotion() ) {
		// No motion at all; the untransformed track leaves the content at its
		// natural position, which is exactly what a static bar should show.
		track.dataset.mqReady = '1';
		return;
	}

	const speed = clamp(
		wrap.dataset.mqSpeed,
		SPEED_MIN,
		SPEED_MAX,
		SPEED_FALLBACK
	);
	const mode =
		wrap.dataset.mqMode === 'rest-then-scroll'
			? 'rest-then-scroll'
			: 'loop';
	const delay =
		mode === 'rest-then-scroll'
			? clamp( wrap.dataset.mqDelay, DELAY_MIN, DELAY_MAX, 0 )
			: 0;
	const dir = wrap.dataset.mqDir === 'right' ? 'right' : 'left';

	// rest-then-scroll only: floor the item at the viewport width.
	//
	// The CSS shrink-wraps the item (width: max-content) so long content can
	// overflow and scroll. The side effect is that SHORT content collapses to
	// its own width and sits hard against the left edge, ignoring the bar's
	// layout — justify-content has nothing left to centre. Loop mode never
	// rests so that is invisible there, but in rest-then-scroll it is the first
	// thing the visitor sees. Flooring the width hands alignment back to the
	// existing CSS instead of reimplementing seven layouts in JS.
	//
	// Deliberately NOT applied to loop mode: with no resting state there is
	// nothing to align, and padding a short item out to a full bar width would
	// only lengthen its cycle and surround it with dead space.
	//
	// Set here rather than as min-width:100% in CSS, because a percentage
	// resolved inside a width:max-content track is circular. The wrapper's own
	// width is parent-driven (width:100% in row scope, flex:1 1 0 + min-width:0
	// in text scope), so writing this back cannot disturb the v just measured.
	item.style.minWidth = mode === 'rest-then-scroll' ? v + 'px' : '';
	const w = item.offsetWidth;

	const total = cycleSeconds( w, v, speed );
	const frames = buildFrames( mode, dir, w, v );

	try {
		track.animate( frames, {
			duration: total * 1000,
			iterations: Infinity,
			easing: 'linear',
			// A WAAPI delay runs ONCE, before the first iteration — not on every
			// lap — which is exactly the wanted behaviour: read the opening, then
			// scroll continuously. fill:'backwards' makes the first keyframe
			// (the resting position) apply while that delay elapses; without it
			// the element would be untransformed but unstyled by the effect.
			delay: delay * 1000,
			fill: delay > 0 ? 'backwards' : 'none',
		} );
	} catch ( e ) {
		// Element.animate missing or refused — leave the content at rest.
	}

	track.dataset.mqReady = '1';
}

/**
 * Cancel every animation on a track.
 *
 * @param {HTMLElement} track The .njt-nofi-marquee-track element.
 *
 * @return {void} Nothing.
 */
function cancelAnimations( track ) {
	if ( typeof track.getAnimations !== 'function' ) {
		return;
	}
	track.getAnimations().forEach( function ( anim ) {
		anim.cancel();
	} );
}

/**
 * @return {boolean} True when the visitor asked for reduced motion.
 */
function prefersReducedMotion() {
	try {
		return window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
	} catch ( e ) {
		return false;
	}
}

/**
 * Pause or resume the animations belonging to one marquee.
 *
 * @param {HTMLElement} wrap   A .njt-nofi-marquee element.
 * @param {boolean}     paused Whether it should be paused.
 *
 * @return {void} Nothing.
 */
function setPaused( wrap, paused ) {
	const track = wrap && wrap.querySelector( TRACK_SEL );
	if ( ! track || typeof track.getAnimations !== 'function' ) {
		return;
	}
	track.getAnimations().forEach( function ( anim ) {
		if ( paused ) {
			anim.pause();
		} else {
			anim.play();
		}
	} );
}

/**
 * Measure every not-yet-measured marquee under the root.
 *
 * @param {HTMLElement|Document} root Scope to scan.
 *
 * @return {void} Nothing.
 */
function scan( root ) {
	try {
		root.querySelectorAll( WRAP_SEL ).forEach( measure );
	} catch ( e ) {
		// Detached root or exotic host page — nothing to do.
	}
}

/**
 * Drop every measurement and take them again. Widths are viewport-dependent,
 * and this is also how a marquee that measured 0 while hidden recovers.
 *
 * @return {void} Nothing.
 */
function remeasureAll() {
	if ( ! rootEl ) {
		return;
	}
	rootEl.querySelectorAll( TRACK_SEL ).forEach( function ( track ) {
		delete track.dataset.mqReady;
	} );
	scan( rootEl );
}

/**
 * Start the marquee engine scoped to a root element. Idempotent: the observer
 * and listeners install once and re-calling only re-scans — which matters
 * because the customizer preview re-runs its init on some setting changes.
 *
 * @param {HTMLElement} [root] Element to scan (defaults to document).
 *
 * @return {void} Nothing.
 */
export function startMarquees( root ) {
	rootEl = root || document;
	scan( rootEl );

	if ( ! observer && typeof window.MutationObserver === 'function' ) {
		// childList + subtree ONLY. measure() writes attributes inside this same
		// root, so observing attributes would make the observer retrigger itself
		// indefinitely.
		observer = new window.MutationObserver( function () {
			scan( rootEl );
		} );
		observer.observe( rootEl, { childList: true, subtree: true } );
	}

	if ( listenersBound ) {
		return;
	}
	listenersBound = true;

	window.addEventListener( 'resize', function () {
		window.clearTimeout( resizeTimer );
		resizeTimer = window.setTimeout( remeasureAll, RESIZE_DEBOUNCE_MS );
	} );

	// Hover pause. Delegated via mouseover/mouseout because those bubble and
	// mouseenter/mouseleave do not — binding per element would double up on the
	// resize re-measure, which re-runs measure() on elements that already have
	// handlers.
	rootEl.addEventListener( 'mouseover', function ( e ) {
		const wrap = e.target.closest ? e.target.closest( WRAP_SEL ) : null;
		if ( wrap ) {
			setPaused( wrap, true );
		}
	} );

	rootEl.addEventListener( 'mouseout', function ( e ) {
		const wrap = e.target.closest ? e.target.closest( WRAP_SEL ) : null;
		// relatedTarget is where the pointer went; ignore moves that stayed
		// inside the same marquee, or the animation would stutter as the
		// pointer crosses child elements.
		if (
			wrap &&
			! ( e.relatedTarget && wrap.contains( e.relatedTarget ) )
		) {
			setPaused( wrap, false );
		}
	} );

	// Touch pause. Deliberately not cleared on touchend: the ticker must STAY
	// frozen after the first tap so the second tap can reach the CTA. It
	// resumes when the visitor touches a different marquee or outside one.
	rootEl.addEventListener(
		'touchstart',
		function ( e ) {
			const wrap = e.target.closest ? e.target.closest( WRAP_SEL ) : null;
			rootEl.querySelectorAll( WRAP_SEL ).forEach( function ( el ) {
				if ( el !== wrap ) {
					setPaused( el, false );
				}
			} );
			if ( wrap ) {
				setPaused( wrap, true );
			}
		},
		{ passive: true }
	);
}
