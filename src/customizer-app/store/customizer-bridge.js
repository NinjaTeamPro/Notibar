/**
 * Customizer bridge — read/write/subscribe helpers for njt_nofi_* settings.
 *
 * All access to wp.customize is guarded so this module can be imported in
 * non-Customizer contexts (unit tests, Storybook) without throwing.
 */
import { debounce } from '../utils/debounce';

// ------------------------------------------------------------------
// Readers
// ------------------------------------------------------------------

/**
 * Parse a JSON string from a Customizer setting.
 * Returns `fallback` on failure.
 *
 * @param {string} settingId wp.customize setting key.
 * @param {*}      fallback  Value to return on parse failure.
 * @return {*} Parsed value from setting, or fallback.
 */
function readSetting( settingId, fallback ) {
	const api = window.wp && window.wp.customize;
	if ( ! api ) {
		return fallback;
	}
	const setting = api( settingId );
	if ( ! setting ) {
		return fallback;
	}
	const raw = setting.get();
	try {
		const parsed = typeof raw === 'string' ? JSON.parse( raw ) : raw;
		return parsed !== null && parsed !== undefined ? parsed : fallback;
	} catch {
		return fallback;
	}
}

/**
 * Read the bars array from the Customizer setting.
 *
 * @return {Array} Parsed bars array, or [] on failure.
 */
export function readBars() {
	return readSetting( 'njt_nofi_bars', [] );
}

/**
 * Read the global config object from the Customizer setting.
 *
 * @return {Object} Parsed global config, or {} on failure.
 */
export function readGlobal() {
	return readSetting( 'njt_nofi_global', {} );
}

// ------------------------------------------------------------------
// Writers (debounced 150ms)
// ------------------------------------------------------------------

/**
 * Write bars array to Customizer setting. Debounced 150ms.
 * @type {Function}
 */
export const writeBars = debounce( ( bars ) => {
	const api = window.wp && window.wp.customize;
	if ( api && api( 'njt_nofi_bars' ) ) {
		api( 'njt_nofi_bars' ).set( JSON.stringify( bars ) );
	}
}, 150 );

/**
 * Write global config to Customizer setting. Debounced 150ms.
 * @type {Function}
 */
export const writeGlobal = debounce( ( global ) => {
	const api = window.wp && window.wp.customize;
	if ( api && api( 'njt_nofi_global' ) ) {
		api( 'njt_nofi_global' ).set( JSON.stringify( global ) );
	}
}, 150 );

/**
 * Flush any pending debounced writes immediately.
 * Used by beforeunload / visibilitychange handlers below so the user never
 * loses the last keystroke when clicking Publish or navigating away.
 */
export function flushPendingWrites() {
	writeBars.flush();
	writeGlobal.flush();
}

// Wire flush triggers once per module load. Customizer admin runs in a single
// page so re-registration is not a concern.
if ( typeof window !== 'undefined' ) {
	window.addEventListener( 'beforeunload', flushPendingWrites );
	if ( typeof document !== 'undefined' ) {
		document.addEventListener( 'visibilitychange', () => {
			if ( document.hidden ) {
				flushPendingWrites();
			}
		} );
	}
}

// ------------------------------------------------------------------
// Subscriber
// ------------------------------------------------------------------

/**
 * Subscribe to a Customizer setting change.
 * Calls cb(parsedValue) when the setting changes externally (undo, revert, etc.).
 *
 * @param {string}   settingId wp.customize setting key.
 * @param {Function} cb        Called with parsed JSON value on change.
 * @return {Function} Unsubscribe function — call to stop listening.
 */
export function subscribe( settingId, cb ) {
	const api = window.wp && window.wp.customize;
	if ( ! api ) {
		return () => {};
	}

	const handler = ( newValue ) => {
		try {
			const parsed =
				typeof newValue === 'string'
					? JSON.parse( newValue )
					: newValue;
			cb( parsed );
		} catch {
			// Malformed JSON — ignore.
		}
	};

	// wp.customize(id, fn) runs fn once the setting is available.
	api( settingId, ( setting ) => {
		setting.bind( handler );
	} );

	return () => {
		api( settingId, ( setting ) => {
			setting.unbind( handler );
		} );
	};
}
