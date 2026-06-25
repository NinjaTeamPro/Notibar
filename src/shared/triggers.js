/* eslint-env browser */
/**
 * Notibar shared display-trigger module (Pro).
 *
 * Defers a bar's reveal until a runtime condition fires. attachTrigger(bar,
 * onFire) wires the right one-shot listener for the bar's behavior.trigger type
 * (scroll / time / click), calls onFire() exactly once when the threshold is
 * reached, then self-cleans. The module knows nothing about display modes — it
 * only watches the page and signals "fire"; the frontend owns promotion.
 *
 * Pure runtime: no DOM markup, passive scroll listener, no leaks.
 *
 * Pro-only; removed from the Lite build via build-tools/pro-manifest.json. Every
 * import + call site is wrapped in @pro/@endpro so the Lite bundle never
 * references this (each triggered bar simply shows immediately in Lite).
 *
 * @since 3.2.0
 */

/**
 * Current scroll position as a percentage (0–100) of the maximum scrollable
 * distance. Falls back to documentElement.scrollTop for older engines.
 *
 * @return {number} Percent scrolled (100 when the page cannot scroll).
 */
function scrolledPercent() {
	const doc = document.documentElement;
	const max = doc.scrollHeight - doc.clientHeight;
	return max <= 0
		? 100
		: ( ( window.scrollY || doc.scrollTop || 0 ) / max ) * 100;
}

/**
 * Maximum reachable scroll percent for the current page: 100 when the page can
 * scroll at all, 0 when it cannot. Drives the "page too short to ever reach the
 * threshold → fire immediately" fallback for the scroll trigger.
 *
 * @return {number} 100 if scrollable, else 0.
 */
function maxScrollPercent() {
	const doc = document.documentElement;
	return doc.scrollHeight - doc.clientHeight <= 0 ? 0 : 100;
}

/**
 * Attach a one-shot display trigger to a bar.
 *
 * Reads bar.behavior.trigger ({ type, value }) and sets up the matching
 * listener. onFire() runs exactly once (guarded), after which the listener is
 * removed. For type 'none' (or anything unrecognised) it fires synchronously —
 * callers should avoid attaching to non-triggered bars, but this stays safe.
 *
 * @param {Object}   bar    Bar object with behavior.trigger.
 * @param {Function} onFire Promotion callback, invoked once when the trigger fires.
 * @return {{ cancel: Function }} Handle; cancel() removes the listener if it has
 *                                not yet fired (e.g. the bar was dismissed first).
 */
export function attachTrigger( bar, onFire ) {
	const trigger = ( bar.behavior && bar.behavior.trigger ) || {
		type: 'none',
		value: 0,
	};
	const { type, value } = trigger;

	let fired = false;
	let cleanup = () => {};

	function fire() {
		if ( fired ) {
			return;
		}
		fired = true;
		cleanup();
		onFire();
	}

	if ( type === 'time' ) {
		const id = setTimeout(
			fire,
			Math.max( 0, Number( value ) || 0 ) * 1000
		);
		cleanup = () => clearTimeout( id );
	} else if ( type === 'scroll' ) {
		const pct = Math.min( 100, Math.max( 1, Number( value ) || 1 ) );
		// Page too short to ever reach pct → fire immediately (defensive).
		if ( maxScrollPercent() < pct ) {
			fire();
		} else {
			const onScroll = () => {
				if ( scrolledPercent() >= pct ) {
					fire();
				}
			};
			window.addEventListener( 'scroll', onScroll, { passive: true } );
			cleanup = () => window.removeEventListener( 'scroll', onScroll );
			onScroll(); // in case already past the threshold on load
		}
	} else if ( type === 'click' ) {
		const target = Math.max( 1, Number( value ) || 1 );
		let count = 0;
		// Capture phase so clicks count even when a handler calls stopPropagation
		// (counts ALL document clicks incl. links/buttons — intended).
		const onClick = () => {
			if ( ++count >= target ) {
				fire();
			}
		};
		document.addEventListener( 'click', onClick, true );
		cleanup = () => document.removeEventListener( 'click', onClick, true );
	} else {
		// 'none' — caller should not invoke attachTrigger for these, but be safe.
		fire();
	}

	return { cancel: cleanup };
}
