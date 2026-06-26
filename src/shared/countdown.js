/* eslint-env browser */
/**
 * Notibar shared countdown ticker (Pro).
 *
 * Hydrates and updates every `.njt-nofi-countdown` block emitted by
 * render-bar.js's renderCountdown(). One module-scoped interval scans the root
 * each second — so it transparently picks up countdowns injected by later
 * re-renders (rotation advance, dismiss, collapse) without being re-called.
 *
 * Modes:
 *   - date:      counts to the server-resolved absolute epoch (data-cd-end, ms).
 *   - evergreen: per-visitor window seeded once into localStorage (continues
 *                across reloads); falls back to a per-load window when storage
 *                is unavailable (private mode).
 *
 * The largest DISPLAYED unit absorbs all higher units (e.g. a 2-hour timer
 * showing only minutes+seconds renders 120:00, not 00:00).
 *
 * At zero the element gets `.is-expired` (hidden via CSS); the bar, its text and
 * button remain. Pro-only: this whole module is removed from the Lite build via
 * pro-manifest.json, and every import + call site is wrapped in the Pro-only
 * build markers so the Lite bundle never references it.
 *
 * @since 3.2.0
 */

const STORAGE_PREFIX = 'njt-notibar-';
const STORAGE_SUFFIX = '-cd-end';

// Seconds per unit — used to break the remaining time into displayed cells.
const UNIT_SEC = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };

// Modulus for the circular ring's fill fraction (value / modulus, capped at 1).
const UNIT_MOD = { days: 30, hours: 24, minutes: 60, seconds: 60 };

let intervalId = null;
let rootEl = null;
let reduceMotion = false;

/**
 * @param {string} barId Bar id.
 * @return {string} localStorage key for a bar's evergreen end timestamp.
 */
function storageKey( barId ) {
	return STORAGE_PREFIX + barId + STORAGE_SUFFIX;
}

/**
 * Read (or seed once) the evergreen end timestamp (ms) for a bar.
 *
 * The stored value is tagged with the bar's reset token. A matching token keeps
 * the persisted window (continues across reloads); a different token — set when
 * the admin clicks "Reset visitors' timers" — re-seeds the full duration once.
 *
 * @param {string} barId       Bar id.
 * @param {number} durationSec Window length in seconds.
 * @param {number} token       Reset token from the bar config (data-cd-token).
 * @param {number} now         The tick's reference time (ms); shared with the
 *                             remaining-time math so the first frame is exactly
 *                             the full duration (no sub-second drift).
 * @return {number} Absolute end timestamp in ms.
 */
function evergreenEnd( barId, durationSec, token, now ) {
	const fresh = now + durationSec * 1000;
	const key = storageKey( barId );
	try {
		const raw = window.localStorage.getItem( key );
		if ( raw ) {
			const saved = JSON.parse( raw );
			// Continue only when the reset token still matches.
			if ( saved && saved.token === token && Number( saved.end ) > 0 ) {
				return Number( saved.end );
			}
		}
		window.localStorage.setItem(
			key,
			JSON.stringify( { end: fresh, token } )
		);
	} catch ( e ) {
		// Storage disabled (private mode) — non-persisted per-load window.
	}
	return fresh;
}

/**
 * Resolve the absolute end (ms) for a countdown element, seeding evergreen once.
 *
 * @param {HTMLElement} el  Countdown element.
 * @param {number}      now The tick's reference time (ms).
 * @return {number} End timestamp in ms (0 when unresolved → treated as expired).
 */
function resolveEnd( el, now ) {
	if ( el.dataset.cdType === 'evergreen' ) {
		const container = el.closest( '[data-bar-id]' );
		const barId = container ? container.getAttribute( 'data-bar-id' ) : '';
		const duration = Math.max( 0, Number( el.dataset.cdDuration ) || 0 );
		const token = Number( el.dataset.cdToken ) || 0;
		// No bar id → skip persistence (avoids a shared storage key collision);
		// use a non-persisted per-load window instead.
		if ( ! barId ) {
			return now + duration * 1000;
		}
		return evergreenEnd( barId, duration, token, now );
	}
	return Number( el.dataset.cdEnd ) || 0;
}

/**
 * Break remaining ms into the displayed units, largest-first absorbing higher
 * units not shown.
 *
 * Uses ceil so each value is shown for its full second: e.g. a 10s timer reads
 * "10" for the first second (remaining 10000→9001ms), "9" for the next, etc.,
 * down to "1", then expires. Flooring would drop the leading number almost
 * instantly and skip a value on the first late interval tick.
 *
 * @param {number}   totalMs Remaining milliseconds.
 * @param {string[]} units   Displayed units in canonical order (days→seconds).
 * @return {Object} Map of unit → integer value.
 */
function breakdown( totalMs, units ) {
	let rem = Math.max( 0, Math.ceil( totalMs / 1000 ) );
	const out = {};
	units.forEach( function ( u ) {
		const sec = UNIT_SEC[ u ] || 1;
		out[ u ] = Math.floor( rem / sec );
		rem -= out[ u ] * sec;
	} );
	return out;
}

/**
 * @param {number} n Value.
 * @return {string} Two-digit zero-padded string.
 */
function pad( n ) {
	return n < 10 ? '0' + n : String( n );
}

/**
 * Paint one element's unit cells from a breakdown.
 *
 * @param {HTMLElement} el    Countdown element.
 * @param {Object}      parts Unit → value map.
 */
function paint( el, parts ) {
	const isFlip = el.classList.contains( 'njt-nofi-countdown--flip' );
	const isCircular = el.classList.contains( 'njt-nofi-countdown--circular' );
	const isText = el.classList.contains( 'njt-nofi-countdown--text' );

	el.querySelectorAll( '.njt-nofi-cd-unit' ).forEach( function ( unitEl ) {
		const unit = unitEl.getAttribute( 'data-cd-unit' );
		const numEl = unitEl.querySelector( '.njt-nofi-cd-num' );
		if ( ! numEl || ! ( unit in parts ) ) {
			return;
		}
		const value = parts[ unit ];
		// Days (and the minimal text style) unpadded; other units 2-digit.
		const next = isText || unit === 'days' ? String( value ) : pad( value );

		if ( numEl.textContent !== next ) {
			numEl.textContent = next;
			if ( isFlip && ! reduceMotion ) {
				numEl.classList.remove( 'is-flipping' );
				// Force reflow so the animation restarts on each change.
				// eslint-disable-next-line no-unused-expressions
				numEl.offsetWidth;
				numEl.classList.add( 'is-flipping' );
			}
		}

		if ( isCircular ) {
			const mod = UNIT_MOD[ unit ] || 60;
			unitEl.style.setProperty(
				'--cd-progress',
				String( Math.min( 1, value / mod ) )
			);
		}
	} );
}

/**
 * Hide leading zero-value units once, from the initial remaining time, so e.g.
 * a sub-day timer reads "02:15:30" instead of "00:02:15:30". Decided a single
 * time at hydration (never re-run) to avoid mid-countdown layout shifts. The
 * smallest unit is always kept, so the timer never goes blank.
 *
 * @param {HTMLElement} el          Countdown element.
 * @param {number}      remainingMs Initial remaining time (ms).
 */
function trimLeadingZeros( el, remainingMs ) {
	const units = ( el.dataset.cdUnits || '' ).split( ',' ).filter( Boolean );
	if ( units.length <= 1 ) {
		return;
	}
	const parts = breakdown( remainingMs, units );
	// Hide leading zeros up to — but never including — the smallest unit.
	for ( let i = 0; i < units.length - 1; i++ ) {
		if ( parts[ units[ i ] ] !== 0 ) {
			break;
		}
		const cell = el.querySelector(
			'.njt-nofi-cd-unit[data-cd-unit="' + units[ i ] + '"]'
		);
		if ( cell ) {
			cell.style.display = 'none';
		}
	}
}

/**
 * One tick: hydrate new elements, update live ones, expire finished ones.
 */
function tick() {
	const scope = rootEl || document;
	const els = scope.querySelectorAll( '.njt-nofi-countdown' );
	if ( ! els.length ) {
		stop(); // No countdowns left in the DOM (e.g. all bars dismissed).
		return;
	}

	const now = Date.now();
	els.forEach( function ( el ) {
		if ( el.classList.contains( 'is-expired' ) ) {
			return;
		}
		// Hydrate once — resolve + cache the absolute end on the element. Pass
		// the tick's `now` so an evergreen seed anchors to the same clock the
		// remaining-time math uses (first frame is exactly the full duration).
		if ( el.dataset.cdReady !== '1' ) {
			const resolved = resolveEnd( el, now );
			el.dataset.cdEndResolved = String( resolved );
			el.dataset.cdReady = '1';
			// Decide leading-zero unit trim once, from the initial remaining,
			// unless the bar opts out via "Always show all selected units".
			if ( el.dataset.cdShowall !== '1' && resolved - now > 0 ) {
				trimLeadingZeros( el, resolved - now );
			}
		}

		const end = Number( el.dataset.cdEndResolved ) || 0;
		if ( ! end || end - now <= 0 ) {
			el.classList.add( 'is-expired' );
			return;
		}

		const units = ( el.dataset.cdUnits || '' )
			.split( ',' )
			.filter( Boolean );
		paint( el, breakdown( end - now, units ) );
	} );
}

/**
 * Stop the ticker (interval cleared; safe to call repeatedly).
 */
function stop() {
	if ( intervalId !== null ) {
		window.clearInterval( intervalId );
		intervalId = null;
	}
}

/**
 * Start the countdown ticker scoped to a root element. Idempotent: a single
 * interval scans the root each tick and re-hydrates elements injected by later
 * re-renders, so re-calling is a no-op.
 *
 * @param {HTMLElement} [root] Element to scan (defaults to document).
 */
export function startCountdowns( root ) {
	rootEl = root || document;
	if ( intervalId !== null ) {
		return;
	}
	try {
		reduceMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
	} catch ( e ) {
		reduceMotion = false;
	}
	tick();
	intervalId = window.setInterval( tick, 1000 );
}
