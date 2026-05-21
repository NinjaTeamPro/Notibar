/**
 * Immutable deep-set helper for dot-notation paths.
 * Returns a new object with the value at the given path replaced.
 * Used by phase-05 bar editor fields to update nested bar properties.
 *
 * @param {Object} obj   Source object (not mutated).
 * @param {string} path  Dot-separated key path, e.g. 'style.bgColor'.
 * @param {*}      value New value to set.
 * @return {Object}      New object with the value at path replaced.
 *
 * @example
 * updatePath( bar, 'style.bgColor', '#ff0000' )
 * // => { ...bar, style: { ...bar.style, bgColor: '#ff0000' } }
 */
export function updatePath( obj, path, value ) {
	const keys = path.split( '.' );
	if ( keys.length === 1 ) {
		return { ...obj, [ keys[ 0 ] ]: value };
	}
	const [ head, ...rest ] = keys;
	return {
		...obj,
		[ head ]: updatePath( obj[ head ] ?? {}, rest.join( '.' ), value ),
	};
}
