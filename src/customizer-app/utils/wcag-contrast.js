/**
 * WCAG 2.1 contrast ratio utilities.
 *
 * Computes relative luminance from a hex color, then the contrast ratio
 * between two colors per https://www.w3.org/TR/WCAG21/#contrast-minimum
 *
 * Zero external dependencies — pure math only.
 */

/**
 * Parse a 3-, 6-, or 8-digit hex color into [r, g, b] in range [0, 255].
 *
 * 8-digit hex (#rrggbbaa, emitted by the alpha-enabled colour picker) is
 * accepted: the alpha pair is dropped and contrast is computed against the
 * solid RGB. Contrast over a transparent fill is genuinely page-dependent, so
 * the solid-colour figure is a deliberate, documented approximation — its
 * purpose is only to avoid a false "unparseable → ratio 1" warning.
 *
 * @param {string} hex e.g. '#ff0000', '#f00', or '#ff000080'
 * @return {number[]|null} [r, g, b] or null if unparseable.
 */
function parseHex( hex ) {
	if ( ! hex || typeof hex !== 'string' ) {
		return null;
	}
	let clean = hex.replace( /^#/, '' );
	// Drop the alpha byte of an 8-digit hex; luminance uses the solid RGB.
	if ( clean.length === 8 ) {
		clean = clean.slice( 0, 6 );
	}
	if ( clean.length === 3 ) {
		const r = parseInt( clean[ 0 ] + clean[ 0 ], 16 );
		const g = parseInt( clean[ 1 ] + clean[ 1 ], 16 );
		const b = parseInt( clean[ 2 ] + clean[ 2 ], 16 );
		return [ r, g, b ];
	}
	if ( clean.length === 6 ) {
		const r = parseInt( clean.slice( 0, 2 ), 16 );
		const g = parseInt( clean.slice( 2, 4 ), 16 );
		const b = parseInt( clean.slice( 4, 6 ), 16 );
		return [ r, g, b ];
	}
	return null;
}

/**
 * Convert a single 8-bit channel value to its linear light contribution.
 * WCAG 2.1 formula: sRGB linearisation.
 *
 * @param {number} val 0-255 channel value.
 * @return {number} Linear value in [0, 1].
 */
function linearize( val ) {
	const srgb = val / 255;
	return srgb <= 0.03928
		? srgb / 12.92
		: Math.pow( ( srgb + 0.055 ) / 1.055, 2.4 );
}

/**
 * Compute relative luminance of a hex colour (WCAG 2.1 §1.4.3).
 *
 * @param {string} hex e.g. '#9af4cf'
 * @return {number} Luminance in [0, 1], or -1 if hex is invalid.
 */
function relativeLuminance( hex ) {
	const rgb = parseHex( hex );
	if ( ! rgb ) {
		return -1;
	}
	const [ r, g, b ] = rgb;
	return (
		0.2126 * linearize( r ) +
		0.7152 * linearize( g ) +
		0.0722 * linearize( b )
	);
}

/**
 * Compute WCAG 2.1 contrast ratio between two hex colours.
 * Returns a value in [1, 21]. Returns 1 if either hex is invalid.
 *
 * @param {string} hex1 First colour.
 * @param {string} hex2 Second colour.
 * @return {number} Contrast ratio (e.g. 4.52 means 4.52:1).
 */
export function contrastRatio( hex1, hex2 ) {
	const l1 = relativeLuminance( hex1 );
	const l2 = relativeLuminance( hex2 );
	if ( l1 < 0 || l2 < 0 ) {
		return 1;
	}
	const lighter = Math.max( l1, l2 );
	const darker = Math.min( l1, l2 );
	return ( lighter + 0.05 ) / ( darker + 0.05 );
}

/**
 * Returns true if the contrast ratio between the two colours meets WCAG AA
 * normal-text threshold (4.5:1).
 *
 * @param {string} hex1 First colour.
 * @param {string} hex2 Second colour.
 * @return {boolean} Whether the pair passes WCAG AA (4.5:1).
 */
export function meetsAA( hex1, hex2 ) {
	return contrastRatio( hex1, hex2 ) >= 4.5;
}
