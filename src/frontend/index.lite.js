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

		if ( ! survivors.length ) {
			// Remove the bar element (not just hide the slot) — body-push's
			// MutationObserver only watches childList, so a display change
			// alone would leave the body padding in place.
			slot.innerHTML = '';
			slot.style.display = 'none';
			return;
		}


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

	} );


	// -----------------------------------------------------------------------
	// Render — stack (Pro), rotation (Pro), or single.
	// -----------------------------------------------------------------------
	let stackRendered = false;


	if ( ! rotationCtrl && ! stackRendered ) {
		slot.innerHTML = renderBarWithCollapsedState(
			survivors[ 0 ],
			globalConfig
		);
	}

	// Reveal — class triggers the @keyframes njt-nofi-slide-in animation
	// on the bar(s) (slide-down + fade-in). Keyframes play unconditionally
	// when the rule matches, so no rAF / reflow dance needed. (Idempotent for
	// stack, which already revealed in renderStack.)
	revealBars();

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
