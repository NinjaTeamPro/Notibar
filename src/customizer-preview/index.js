/* eslint-env browser */
/**
 * Notibar — Customizer Preview iframe entry point.
 *
 * Bundled by @wordpress/scripts — do NOT edit build/ directly.
 *
 * Subscribes to njt_nofi_bars and njt_nofi_global Customizer settings
 * (both registered with transport=postMessage) and re-renders the bars
 * region in the preview iframe on every change.
 *
 * wp global is provided by the `customize-preview` script dependency
 * declared in AssetLoader::enqueue_customizer_preview(). Using window.wp
 * avoids the ESLint no-redeclare warning that `/* global wp *\/` triggers
 * when the variable is also declared by the dependency script.
 *
 * @since 3.0.0
 */

import { renderBarHTML } from '../shared/render-bar.js';
import { filterBars } from '../shared/filter-bars.js';
import { startRotation } from '../shared/rotation.js';
import { installBodyPush } from '../shared/body-push.js';
import { PREVIEW_STYLES } from '../shared/preview-styles.js';

const SLOT_ID = 'njt-notibar-slot';
const STYLE_ID = 'njt-notibar-preview-style';
const DEBOUNCE_MS = 50;
const FOCUS_EVENT = 'notibar-preview-focus';

// When the controls SPA is in its bar-editor drill-down, it sends a focus
// event with the bar ID being edited. While set, the preview renders ONLY
// that bar (no filtering, no rotation) so the admin always sees what they
// are editing. null = normal display-mode behaviour.
let focusedBarId = null;

// ------------------------------------------------------------------
// Module state
// ------------------------------------------------------------------

let activeRotation = null;
let debounceTimer = null;

// ------------------------------------------------------------------
// Inline style injection
// ------------------------------------------------------------------

/**
 * Inject preview baseline CSS once into the iframe <head>.
 */
function injectPreviewStyles() {
	if ( document.getElementById( STYLE_ID ) ) {
		return;
	}
	const style = document.createElement( 'style' );
	style.id = STYLE_ID;
	style.textContent = PREVIEW_STYLES;
	document.head.appendChild( style );
}

// ------------------------------------------------------------------
// Slot management
// ------------------------------------------------------------------

/**
 * Return the preview slot element, creating it if absent.
 *
 * @return {HTMLElement} Slot div element.
 */
function ensureSlot() {
	let slot = document.getElementById( SLOT_ID );
	if ( ! slot ) {
		slot = document.createElement( 'div' );
		slot.id = SLOT_ID;
		slot.className = 'njt-nofi-preview-slot';
		document.body.insertBefore( slot, document.body.firstChild );
	}
	return slot;
}

// ------------------------------------------------------------------
// Device detection
// ------------------------------------------------------------------

/**
 * Resolve the current device string using wp.customize.previewedDevice()
 * when available (Customizer responsive toggle), falling back to a
 * matchMedia check. Returns 'desktop' | 'mobile'.
 *
 * @return {string} 'desktop' or 'mobile'.
 */
function resolveDevice() {
	const wp = window.wp;
	if (
		wp &&
		wp.customize &&
		typeof wp.customize.previewedDevice === 'function'
	) {
		const d = wp.customize.previewedDevice();
		// Customizer returns 'desktop' | 'tablet' | 'mobile'.
		// Treat tablet as mobile for bar display purposes.
		return d === 'desktop' ? 'desktop' : 'mobile';
	}
	// Fallback: infer from viewport width.
	return window.matchMedia( '(max-width: 480px)' ).matches
		? 'mobile'
		: 'desktop';
}

// ------------------------------------------------------------------
// Core re-render
// ------------------------------------------------------------------

/**
 * Parse the current setting values, filter bars, and update the slot DOM.
 * Stops any active rotation before starting a new one to prevent leaks.
 */
function rerender() {
	const wp = window.wp;
	if ( ! wp || ! wp.customize ) {
		return;
	}

	// Parse both settings; fall back to empty defaults on bad JSON.
	let bars = [];
	let global = {};

	try {
		bars = JSON.parse( wp.customize( 'njt_nofi_bars' ).get() || '[]' );
	} catch ( e ) {
		bars = [];
	}

	try {
		global = JSON.parse( wp.customize( 'njt_nofi_global' ).get() || '{}' );
	} catch ( e ) {
		global = {};
	}

	const slot = ensureSlot();

	// Stop previous rotation before touching innerHTML (prevents stale refs).
	if ( activeRotation ) {
		activeRotation.stop();
		activeRotation = null;
	}

	// Focus override — when the SPA is editing a specific bar, render only
	// that bar. Skip display-logic filter AND rotation: admin must always
	// see the bar being edited regardless of page context or display mode.
	if ( focusedBarId ) {
		const focused = bars.find( ( b ) => b && b.id === focusedBarId );
		if ( focused ) {
			renderSingle( slot, focused, global );
			wireDismissDelegate( slot );
			return;
		}
		// Focused bar no longer exists (deleted) — fall through to normal mode.
	}

	// Build preview context: permissive (isPreview skips device + dismissal gates).
	// Inherit currentCptType + currentObjectId from the server-emitted data so
	// CPT-targeted bars evaluate correctly in the preview iframe (the iframe
	// IS the previewed URL — its PHP render context reflects the actual page).
	const serverCtx =
		( window.njtNotibarData && window.njtNotibarData.ctx ) || {};
	const ctx = {
		pageId: 0,
		postId: 0,
		isHome: false,
		device: resolveDevice(),
		dismissed: [],
		isPreview: true,
		currentCptType: serverCtx.currentCptType || '',
		currentObjectId: serverCtx.currentObjectId || 0,
	};

	const visible = filterBars( bars, ctx );

	if ( ! visible.length ) {
		slot.innerHTML = '';
		return;
	}

	const isRotation = global.displayMode === 'rotation' && visible.length > 1;

	if ( isRotation ) {
		activeRotation = startRotation( {
			slot,
			bars: visible,
			renderFn: renderBarHTML,
			global,
		} );
	} else {
		renderSingle( slot, visible[ 0 ], global );
	}

	wireDismissDelegate( slot );
}

/**
 * Render a single bar into the slot, then flush layout + add visible class
 * so the v2-style slide-in transition plays.
 *
 * @param {HTMLElement} slot   Slot element.
 * @param {Object}      bar    Bar to render.
 * @param {Object}      global Global config (passed through to renderBarHTML).
 */
function renderSingle( slot, bar, global ) {
	slot.innerHTML = renderBarHTML( bar, global );
	const containerContent = slot.querySelector(
		'.njt-nofi-container-content'
	);
	if ( containerContent ) {
		// Class triggers @keyframes njt-nofi-slide-in animation in
		// notibar.css. Keyframes play unconditionally.
		containerContent.classList.add( 'njt-nofi-visible' );
	}
}

/**
 * Delegate close / toggle clicks on the slot. Re-applies on every render so
 * innerHTML swaps don't drop handlers.
 *
 * @param {HTMLElement} slot Slot element to bind the delegate handler on.
 */
function wireDismissDelegate( slot ) {
	slot.onclick = function ( e ) {
		const btn = e.target.closest( '.njt-nofi-close, .njt-nofi-toggle' );
		if ( ! btn ) {
			return;
		}
		const barEl = btn.closest( '.njt-nofi-container-content' );
		if ( barEl ) {
			barEl.style.display = 'none';
		}
	};
}

// ------------------------------------------------------------------
// Edit affordance — preview-only "Edit" button on each rendered bar.
// Sends the messenger event 'notibar-edit-bar' to the parent Customizer,
// where the SPA drills into the bar editor for that ID.
// ------------------------------------------------------------------

const EDIT_ICON_SVG =
	'<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
	'<path d="M14.7 2.3l3 3-10 10-4 1 1-4z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
	'</svg>';

function injectEditButton( slot ) {
	// Skip when an external focus is active — the admin is already editing
	// this bar; an Edit button on the bar they're already editing is noise.
	if ( focusedBarId ) {
		return;
	}
	const cc = slot.querySelector( '.njt-nofi-container-content' );
	if ( ! cc || cc.querySelector( '.njt-nofi-edit-btn' ) ) {
		return;
	}
	const barId = cc.getAttribute( 'data-bar-id' );
	if ( ! barId ) {
		return;
	}
	const btn = document.createElement( 'button' );
	btn.type = 'button';
	btn.className = 'njt-nofi-edit-btn';
	btn.setAttribute( 'data-bar-id', barId );
	btn.setAttribute( 'aria-label', 'Edit this notification bar' );
	btn.innerHTML = EDIT_ICON_SVG + '<span>Edit</span>';
	cc.appendChild( btn );
}

function installEditAffordance( slot ) {
	injectEditButton( slot );
	const mo = new MutationObserver( function () {
		injectEditButton( slot );
	} );
	mo.observe( slot, { childList: true, subtree: true } );

	// Capture-phase click delegate — runs before the dismiss handler so
	// the Edit click doesn't accidentally trigger any other close/toggle
	// listener that may match on bubble.
	slot.addEventListener( 'click', function ( e ) {
		const btn = e.target.closest( '.njt-nofi-edit-btn' );
		if ( ! btn ) {
			return;
		}
		e.preventDefault();
		e.stopPropagation();
		const barId = btn.getAttribute( 'data-bar-id' );
		const wp = window.wp;
		if (
			barId &&
			wp &&
			wp.customize &&
			wp.customize.preview &&
			typeof wp.customize.preview.send === 'function'
		) {
			wp.customize.preview.send( 'notibar-edit-bar', { barId } );
		}
	}, true );
}

// ------------------------------------------------------------------
// Debounced re-render
// ------------------------------------------------------------------

function scheduleRerender() {
	if ( debounceTimer ) {
		clearTimeout( debounceTimer );
	}
	debounceTimer = setTimeout( rerender, DEBOUNCE_MS );
}

// ------------------------------------------------------------------
// Bootstrap
// ------------------------------------------------------------------

/**
 * Wire up subscriptions and perform initial render.
 * Called once when the Customizer preview is ready.
 */
function init() {
	const wp = window.wp;
	if ( ! wp || ! wp.customize ) {
		return;
	}

	injectPreviewStyles();
	const slot = ensureSlot();

	// v3 — keep iframe body padded by bar height so admin sees what the live
	// frontend layout will look like. Observer handles live re-renders.
	installBodyPush( slot );

	// v3.1 — inject an "Edit" affordance on every preview render so the admin
	// can jump straight from the visual preview into the bar editor.
	installEditAffordance( slot );

	// Subscribe to both settings; each change triggers a debounced re-render.
	wp.customize( 'njt_nofi_bars', function ( setting ) {
		setting.bind( scheduleRerender );
	} );

	wp.customize( 'njt_nofi_global', function ( setting ) {
		setting.bind( scheduleRerender );
	} );

	// Listen for SPA focus events — sent when the admin drills into a
	// specific bar editor (or backs out). Payload: { barId: string|null }.
	if ( wp.customize.preview && wp.customize.preview.bind ) {
		wp.customize.preview.bind( FOCUS_EVENT, function ( data ) {
			focusedBarId =
				data && typeof data.barId === 'string' ? data.barId : null;
			scheduleRerender();
		} );
	}

	// Initial render on preview load.
	rerender();
}

// Use `customize-preview` ready event so postMessage transport is wired.
if ( window.wp && window.wp.customize ) {
	window.wp.customize.bind( 'preview-ready', init );
} else {
	document.addEventListener( 'DOMContentLoaded', init );
}
