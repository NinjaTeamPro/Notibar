/**
 * Notibar — Customizer Controls SPA entry point.
 *
 * Bundled by @wordpress/scripts — do NOT edit build/ directly.
 *
 * Boot sequence:
 *  1. Register apiFetch nonce + REST root middleware.
 *  2. Wait for wp.customize 'ready' event.
 *  3. createRoot → <App />.
 */
import { createRoot, render } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { App } from './App';

// Import SCSS so wp-scripts extracts build/customizer-app.css alongside the
// JS bundle. AssetLoader::enqueue_customizer_controls() expects the file
// at build/customizer-app.css and conditionally enqueues it.
import './index.scss';

// ------------------------------------------------------------------
// apiFetch middleware (REST nonce + root URL)
// ------------------------------------------------------------------
const boot = window.njtNotibarBoot || {};

if ( boot.restNonce ) {
	apiFetch.use( apiFetch.createNonceMiddleware( boot.restNonce ) );
}
if ( boot.restRoot ) {
	apiFetch.use( apiFetch.createRootURLMiddleware( boot.restRoot ) );
}

// ------------------------------------------------------------------
// Mount
// ------------------------------------------------------------------

/**
 * Mount the React SPA into #njt-notibar-app.
 * Uses createRoot (WP ≥ 6.2 ships React 18) with fallback to legacy render.
 */
function mountApp() {
	const mountNode = document.getElementById( 'njt-notibar-app' );
	if ( ! mountNode ) {
		return;
	}

	if ( typeof createRoot === 'function' ) {
		createRoot( mountNode ).render( <App /> );
	} else {
		// Fallback for WP versions shipping React < 18.
		render( <App />, mountNode );
	}
}

// Defer until Customizer is fully ready.
if ( window.wp && window.wp.customize ) {
	window.wp.customize.bind( 'ready', mountApp );
} else {
	// Fallback for non-Customizer contexts (e.g. standalone testing).
	document.addEventListener( 'DOMContentLoaded', mountApp );
}
