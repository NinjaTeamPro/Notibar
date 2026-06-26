/**
 * Notibar — Frontend runtime entry point.
 *
 * Reads window.njtNotibarData (inlined by PHP), filters bars client-side,
 * renders first survivor, wires dismissal/toggle handlers, starts rotation
 * when applicable, and applies theme-compat callbacks.
 *
 * No jQuery. Vanilla JS only.
 *
 * @since 3.0.0
 */
/* eslint-env browser */

import { filterBars } from '../shared/filter-bars';
import { renderBarHTML } from '../shared/render-bar';
/* @pro */
import { startRotation } from '../shared/rotation';
import { buildStacksHTML } from '../shared/stack';
import { attachTrigger } from '../shared/triggers';
import { startCountdowns } from '../shared/countdown';
// Second filter-bars import, kept inside the Pro-only block so it strips in Lite.
// eslint-disable-next-line no-duplicate-imports
import { nextScheduleClose } from '../shared/filter-bars';
/* @endpro */
import { installBodyPush } from '../shared/body-push';
import { installMobileAdminBarOffset } from '../shared/mobile-admin-bar-offset';
import { isDismissed, dismiss } from './cookies';
import { applyThemeCompat } from './theme-compat';

const COLLAPSED_CLASS = 'njt-nofi-collapsed';
const COLLAPSED_STORAGE_PREFIX = 'njt-notibar-';
const COLLAPSED_STORAGE_SUFFIX = '-collapsed';

function collapsedKey( barId ) {
	return `${ COLLAPSED_STORAGE_PREFIX }${ barId }${ COLLAPSED_STORAGE_SUFFIX }`;
}

function isCollapsed( barId ) {
	try {
		return window.sessionStorage.getItem( collapsedKey( barId ) ) === '1';
	} catch ( e ) {
		return false; // Private mode etc. — graceful no-op.
	}
}

function setCollapsed( barId, collapsed ) {
	try {
		const key = collapsedKey( barId );
		if ( collapsed ) {
			window.sessionStorage.setItem( key, '1' );
		} else {
			window.sessionStorage.removeItem( key );
		}
	} catch ( e ) {
		// no-op
	}
}

/**
 * Wrapper around renderBarHTML that re-applies persisted collapsed state
 * after the markup is emitted. Used everywhere instead of renderBarHTML so
 * rotation, dismiss-rerender, and initial-render paths all stay consistent.
 *
 * @param {Object} bar
 * @param {Object} globalConfig
 * @return {string} HTML markup (possibly with .njt-nofi-collapsed injected).
 */
function renderBarWithCollapsedState( bar, globalConfig ) {
	const html = renderBarHTML( bar, globalConfig );
	if ( ! isCollapsed( bar.id ) ) {
		return html;
	}
	return html.replace(
		'class="njt-nofi-container-content"',
		`class="njt-nofi-container-content ${ COLLAPSED_CLASS }"`
	);
}

/**
 * Detect current device type via media query.
 *
 * @return {'mobile'|'desktop'} Active device class based on viewport width.
 */
function detectDevice() {
	return matchMedia( '(max-width:480px)' ).matches ? 'mobile' : 'desktop';
}

/**
 * Whether a bar defers its reveal behind a display trigger (Pro). Lite-safe:
 * the trigger check is stripped from the Lite build, so this always returns
 * false there — every bar is treated as immediate (today's behavior).
 *
 * @param {Object} bar Bar object.
 * @return {boolean} True when the bar has a non-"none" trigger (Pro only).
 */
function isPending( bar ) {
	let pending = false;
	/* @pro */
	const t = bar && bar.behavior && bar.behavior.trigger;
	pending = !! ( t && t.type && t.type !== 'none' );
	/* @endpro */
	return pending;
}

/**
 * Initialise the frontend notification bar runtime.
 *
 * @return {void}
 */
function init() {
	const data = window.njtNotibarData;
	if ( ! data ) {
		return;
	}

	const { bars = [], global: globalConfig = {}, ctx = {} } = data;
	/* @pro */
	// Localized countdown labels (Pro) — passed through global to the renderer.
	globalConfig.i18n = data.i18n;
	/* @endpro */
	if ( ! bars.length ) {
		return;
	}

	// Resolve slot — server emits it; fall back to creating one.
	let slot = document.getElementById( 'njt-notibar-slot' );
	if ( ! slot ) {
		slot = document.createElement( 'div' );
		slot.id = 'njt-notibar-slot';
		slot.setAttribute( 'role', 'status' );
		slot.setAttribute( 'aria-live', 'polite' );
		document.body.appendChild( slot );
	}

	/* @pro */
	// Honour reduced-motion preference — no rotation, single render only.
	const prefersReducedMotion = matchMedia(
		'(prefers-reduced-motion: reduce)'
	).matches;
	/* @endpro */

	// Build client-side context.
	ctx.device = detectDevice();
	ctx.dismissed = bars
		.filter( ( b ) => isDismissed( b.id ) )
		.map( ( b ) => String( b.id ) );
	ctx.isPreview = false;

	let survivors = filterBars( bars, ctx );

	if ( ! survivors.length ) {
		slot.style.display = 'none';
		return;
	}

	/* @pro */
	// Resolve "schedule" countdowns that use the visitor's local time: the
	// browser owns the visitor's clock + weekday, so the close instant is
	// computed here (site-TZ schedules were already resolved server-side).
	// Normalize to a fixed-instant 'date' countdown so the renderer/ticker stay
	// schedule-agnostic; 0 (no close) → renders nothing.
	survivors.forEach( function ( bar ) {
		if ( bar.countdown && bar.countdown.type === 'schedule' ) {
			bar.countdown.type = 'date';
			bar.countdown.endEpoch = nextScheduleClose( bar );
		}
	} );
	/* @endpro */

	// Split survivors into bars shown at load (immediate) and bars whose reveal
	// is deferred behind a display trigger (pending). `live` is the set actually
	// on screen now (⊆ survivors); promotion appends to it when a trigger fires.
	// Lite: isPending() is always false → immediate = survivors, pending = [],
	// live = survivors — i.e. today's behavior, no deferral.
	const immediate = survivors.filter( ( b ) => ! isPending( b ) );
	const pending = survivors.filter( isPending );
	let live = immediate.slice();

	/** @type {{ stop: Function }|null} */
	let rotationCtrl = null;

	// Reveal every rendered bar — adds the class that triggers the
	// @keyframes njt-nofi-slide-in animation. One match for single/rotation,
	// N matches for stack mode.
	function revealBars() {
		slot.querySelectorAll( '.njt-nofi-container-content' ).forEach(
			function ( el ) {
				el.classList.add( 'njt-nofi-visible' );
			}
		);
	}

	/* @pro */
	const isStackMode = globalConfig.displayMode === 'stack';
	const isRotationMode = globalConfig.displayMode === 'rotation';
	// Arrows enabled by default; mirrors the rotation engine's own gate.
	const arrowsOn = globalConfig.rotationShowArrows !== false;
	// Pending bars' trigger handles, keyed by bar id, so a bar dismissed before
	// its trigger fires can have the listener cancelled (no phantom reveal).
	const triggerHandles = new Map();

	// Stack mode (Pro): render every live bar at once, split top/bottom by
	// placement. Reused by the dismissal handler and trigger promotion to
	// rebuild after the live set changes.
	function renderStack() {
		slot.innerHTML = buildStacksHTML(
			live,
			globalConfig,
			renderBarWithCollapsedState
		);
		revealBars();
	}

	// Rotation mode (Pro): (re)start the rotation engine from the current `live`
	// pool. focusBar (optional) is a just-promoted bar to show first via the
	// startIndex option. Handles pool sizes 0 (nothing live yet), 1 (single
	// render), and ≥2 (rotate, honouring the reduced-motion/arrows gate).
	function refreshRotation( focusBar ) {
		if ( rotationCtrl ) {
			rotationCtrl.stop();
			rotationCtrl = null;
		}
		const startIndex = focusBar
			? Math.max( 0, live.indexOf( focusBar ) )
			: 0;
		if ( live.length >= 2 && ( ! prefersReducedMotion || arrowsOn ) ) {
			rotationCtrl = startRotation( {
				slot,
				bars: live,
				renderFn: renderBarWithCollapsedState,
				global: globalConfig,
				autoplay: ! prefersReducedMotion,
				startIndex,
			} );
		} else if ( live.length >= 1 ) {
			slot.innerHTML = renderBarWithCollapsedState(
				live[ startIndex ] || live[ 0 ],
				globalConfig
			);
			revealBars();
		} else {
			slot.innerHTML = ''; // nothing live yet — slot stays armed for injection
		}
	}
	/* @endpro */

	// -----------------------------------------------------------------------
	// Dismissal handler — called on × button click.
	// -----------------------------------------------------------------------
	function handleDismiss( barId ) {
		const bar = survivors.find(
			( b ) => String( b.id ) === String( barId )
		);
		if ( bar ) {
			dismiss( barId, bar.behavior ? bar.behavior.reopenAfterDays : 0 );
		}

		survivors = survivors.filter(
			( b ) => String( b.id ) !== String( barId )
		);

		/* @pro */
		// Drop from the live pool and cancel any still-pending trigger so a bar
		// dismissed before it fires never appears later.
		live = live.filter( ( b ) => String( b.id ) !== String( barId ) );
		const handle = triggerHandles.get( String( barId ) );
		if ( handle ) {
			handle.cancel();
			triggerHandles.delete( String( barId ) );
		}
		/* @endpro */

		if ( ! survivors.length ) {
			// Remove the bar element (not just hide the slot) — body-push's
			// MutationObserver only watches childList, so a display change
			// alone would leave the body padding in place.
			slot.innerHTML = '';
			slot.style.display = 'none';
			/* @pro */
			if ( rotationCtrl ) {
				rotationCtrl.stop();
				rotationCtrl = null;
			}
			/* @endpro */
			return;
		}

		/* @pro */
		// Rotation mode: restart from the reduced live pool (preserves the
		// reduced-motion autoplay decision; single render when ≤1 live).
		if ( isRotationMode ) {
			refreshRotation();
			return;
		}

		// Stack mode: rebuild the stack from the reduced live set.
		if ( isStackMode ) {
			renderStack();
			return;
		}
		/* @endpro */

		// Single render — first survivor.
		slot.innerHTML = renderBarWithCollapsedState(
			survivors[ 0 ],
			globalConfig
		);
	}

	// -----------------------------------------------------------------------
	// Toggle handler — collapses/expands the currently-active bar's container.
	// Persists per-bar to sessionStorage (no cookie — survives within session
	// but not across reload-after-close per spec).
	// -----------------------------------------------------------------------
	function handleToggle( barId ) {
		const wasCollapsed = isCollapsed( barId );
		setCollapsed( barId, ! wasCollapsed );
		const container = slot.querySelector(
			`[data-bar-id="${ CSS.escape( barId ) }"]`
		);
		if ( container ) {
			container.classList.toggle( COLLAPSED_CLASS, ! wasCollapsed );
		}
	}

	// -----------------------------------------------------------------------
	// Delegated click handler on slot.
	// -----------------------------------------------------------------------
	slot.addEventListener( 'click', function ( e ) {
		// CTA button configured with the "close" action — dismiss the bar like
		// the × control. Checked first so it wins over nav-arrow handling.
		const closeAction = e.target.closest( '[data-njt-action="close"]' );
		if ( closeAction ) {
			e.preventDefault();
			const container = closeAction.closest( '[data-bar-id]' );
			const barId = container ? container.dataset.barId : null;
			if ( barId ) {
				handleDismiss( barId );
			}
			return;
		}

		const closeBtn = e.target.closest( '.njt-nofi-close' );
		if ( closeBtn ) {
			const container = closeBtn.closest( '[data-bar-id]' );
			const barId = container ? container.dataset.barId : null;
			if ( barId ) {
				handleDismiss( barId );
			}
			return;
		}

		const toggleBtn = e.target.closest( '.njt-nofi-toggle' );
		if ( toggleBtn ) {
			const container = toggleBtn.closest( '[data-bar-id]' );
			const barId = container ? container.dataset.barId : null;
			if ( barId ) {
				handleToggle( barId );
			}
			return;
		}

		/* @pro */
		// Manual prev/next arrows — only act when the rotation controller is
		// live (it owns the index + timer-reset logic).
		if ( e.target.closest( '.njt-nofi-nav-prev' ) && rotationCtrl ) {
			rotationCtrl.prev();
			return;
		}
		if ( e.target.closest( '.njt-nofi-nav-next' ) && rotationCtrl ) {
			rotationCtrl.next();
		}
		/* @endpro */
	} );

	/* @pro */
	// Keyboard nav — scoped to focus within the slot. keydown only reaches this
	// listener when a focusable descendant (CTA link, close/toggle, or an arrow)
	// is focused. No document-level listener: page scroll, form inputs, and
	// other carousels are never hijacked. ArrowLeft/Right have no native action
	// on the focused controls, so preventDefault on just those two is safe.
	slot.addEventListener( 'keydown', function ( e ) {
		if ( ! rotationCtrl ) {
			return;
		}
		if ( e.key === 'ArrowLeft' ) {
			e.preventDefault();
			rotationCtrl.prev();
		} else if ( e.key === 'ArrowRight' ) {
			e.preventDefault();
			rotationCtrl.next();
		}
	} );
	/* @endpro */

	// -----------------------------------------------------------------------
	// Initial render + pending-trigger promotion.
	//   stack / rotation (Pro): render the immediate `live` pool now; each
	//     pending bar attaches a trigger that injects it into `live` on fire
	//     (stack rebuild / rotation pool-grow jumping to the fired bar).
	//   single: the Lite-safe fallback — only survivors[0] is ever shown, gated
	//     when it carries a trigger.
	// In Lite every Pro-only block is stripped and pending is empty, so this
	// reduces to "render the first survivor immediately" — today's behavior.
	// -----------------------------------------------------------------------
	let claimed = false;
	/* @pro */
	// Stack mode shows every live bar at once; takes precedence over rotation
	// (display modes are mutually exclusive).
	if ( isStackMode ) {
		renderStack(); // live = immediate (may be empty → empty stack)
		pending.forEach( ( bar ) => {
			const h = attachTrigger( bar, () => {
				live.push( bar );
				renderStack();
			} );
			triggerHandles.set( String( bar.id ), h );
		} );
		claimed = true;
	} else if ( isRotationMode ) {
		// Rotation over the immediate pool; reduced-motion/arrows gating lives
		// in refreshRotation(). Each fired bar joins the pool and is shown first.
		refreshRotation();
		pending.forEach( ( bar ) => {
			const h = attachTrigger( bar, () => {
				live.push( bar );
				refreshRotation( bar );
			} );
			triggerHandles.set( String( bar.id ), h );
		} );
		claimed = true;
	}
	/* @endpro */

	if ( ! claimed ) {
		// Single mode — only the first survivor is ever shown. Render it now
		// unless it carries a trigger (Pro); the Pro block below gates that case.
		// Two separate guards (no else) so the Lite-stripped form leaves no empty
		// block — the immediate render stands alone.
		const first = survivors[ 0 ];
		if ( ! isPending( first ) ) {
			slot.innerHTML = renderBarWithCollapsedState( first, globalConfig );
		}
		/* @pro */
		if ( isPending( first ) ) {
			const h = attachTrigger( first, () => {
				live = [ first ];
				slot.innerHTML = renderBarWithCollapsedState(
					first,
					globalConfig
				);
				revealBars();
			} );
			triggerHandles.set( String( first.id ), h );
		}
		/* @endpro */
	}

	// Reveal — class triggers the @keyframes njt-nofi-slide-in animation
	// on the bar(s) (slide-down + fade-in). Keyframes play unconditionally
	// when the rule matches, so no rAF / reflow dance needed. (Idempotent for
	// stack, which already revealed in renderStack.)
	revealBars();

	/* @pro */
	// Countdown timers (Pro) — one ticker scans the slot each second; survives
	// rotation/dismiss/collapse re-renders and hydrates any later-injected bars.
	startCountdowns( slot );
	/* @endpro */

	// Theme-compat patches.
	applyThemeCompat( ctx.theme, slot );

	// v3 — push body down by bar height so site header isn't covered by a
	// fixed/absolute-positioned bar. ResizeObserver re-syncs on rotation,
	// collapse-toggle, dismiss, and responsive breakpoint changes.
	installBodyPush( slot );

	// ≤600px + admin bar: WP's admin bar is position:absolute there and
	// scrolls away — clamp the fixed bar's top to follow it (46 → 0).
	installMobileAdminBarOffset( slot );

	// Emit custom event so themes/plugins can hook post-render.
	slot.dispatchEvent(
		new CustomEvent( 'njt_nofi_bar_rendered', { bubbles: true } )
	);
}

document.addEventListener( 'DOMContentLoaded', init );
