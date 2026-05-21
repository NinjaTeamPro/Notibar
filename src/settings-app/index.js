/**
 * Notibar — Settings page SPA entry point.
 *
 * Mounted on admin.php?page=notibar-settings (top-level Notibar menu → Settings).
 * No wp.customize dependency — pure admin page.
 *
 * Boot sequence:
 *  1. Register apiFetch nonce + REST root middleware.
 *  2. Wait for DOMContentLoaded.
 *  3. createRoot → <App />.
 */
import { createRoot, render } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { App } from './App';

// Import SCSS so wp-scripts extracts build/settings-app.css alongside the JS
// bundle. AssetLoader::enqueue_settings_app() expects the file at that path.
import './index.scss';

// ------------------------------------------------------------------
// apiFetch middleware (REST nonce + root URL)
// ------------------------------------------------------------------
const boot = window.njtNotibarSettingsBoot || {};

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
 * Mount the React SPA into #njt-notibar-settings-app.
 * Uses createRoot (WP ≥ 6.2 ships React 18) with fallback to legacy render.
 */
function mountApp() {
	const mountNode = document.getElementById( 'njt-notibar-settings-app' );
	if ( ! mountNode ) {
		return;
	}

	if ( typeof createRoot === 'function' ) {
		createRoot( mountNode ).render( <App boot={ boot } /> );
	} else {
		// Fallback for WP versions shipping React < 18.
		render( <App boot={ boot } />, mountNode );
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mountApp );
} else {
	mountApp();
}
