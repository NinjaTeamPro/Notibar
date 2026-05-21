/**
 * Minimal debounce utility — avoids lodash dependency.
 *
 * @param {Function} fn   Function to debounce.
 * @param {number}   wait Milliseconds to wait.
 * @return {Function}        Debounced function with `.flush()` method.
 */
export function debounce( fn, wait ) {
	let timer = null;

	function debounced( ...args ) {
		clearTimeout( timer );
		timer = setTimeout( () => {
			timer = null;
			fn( ...args );
		}, wait );
	}

	debounced.flush = function ( ...args ) {
		if ( timer !== null ) {
			clearTimeout( timer );
			timer = null;
			fn( ...args );
		}
	};

	debounced.cancel = function () {
		clearTimeout( timer );
		timer = null;
	};

	return debounced;
}
