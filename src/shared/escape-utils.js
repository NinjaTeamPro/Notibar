/**
 * Escape utilities for safe HTML generation.
 *
 * Used by render-bar.js to prevent XSS when building markup from bar data.
 * NOTE: bar.content.text / bar.content.textMobile are pre-sanitized via
 * wp_kses_post on the server-side save — they are SAFE for innerHTML.
 * All other user-controlled strings (button text/url, colors, etc.) MUST
 * go through escapeAttr() or escapeText() before being placed in markup.
 *
 * @since 3.0.0
 */

const ESCAPE_ATTR_MAP = {
	'&': '&amp;',
	'"': '&quot;',
	"'": '&#x27;',
	'<': '&lt;',
	'>': '&gt;',
};

/**
 * Escape a string for safe use inside an HTML attribute value.
 * Covers &, ", ', <, >.
 *
 * @param {*} value Value to escape (coerced to string).
 *
 * @return {string} Escaped string.
 */
export function escapeAttr( value ) {
	return String( value === null || value === undefined ? '' : value ).replace(
		/[&"'<>]/g,
		( ch ) => ESCAPE_ATTR_MAP[ ch ]
	);
}

/**
 * Escape a string for safe use as HTML text content.
 * Encodes &, <, > — sufficient for element text nodes.
 *
 * @param {*} value Value to escape (coerced to string).
 *
 * @return {string} Escaped string.
 */
export function escapeText( value ) {
	return String( value === null || value === undefined ? '' : value )
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}

const DECODE_ENTITIES_MAP = {
	'&amp;': '&',
	'&lt;': '<',
	'&gt;': '>',
	'&quot;': '"',
	'&#39;': "'",
	'&#x27;': "'",
};

/**
 * Decode the basic HTML entities our render layer would re-encode.
 *
 * Why: legacy v2.x button text was stored via wp_filter_nohtml_kses, which
 * entity-encodes "&" → "&amp;". When render-bar.js then runs escapeText()
 * on that stored value, "&amp;" becomes "&amp;amp;" and the visitor sees
 * literal "&amp;" instead of "&". Decoding first, then re-escaping at the
 * render layer, yields the correct character regardless of whether the
 * stored value was raw or pre-encoded. Plain text fields only — never
 * call on bar.content.text (which legitimately holds HTML markup).
 *
 * @param {*} value Value to decode (coerced to string).
 *
 * @return {string} String with basic entities decoded.
 */
export function decodeBasicEntities( value ) {
	return String( value === null || value === undefined ? '' : value ).replace(
		/&(?:amp|lt|gt|quot|#39|#x27);/gi,
		( m ) => DECODE_ENTITIES_MAP[ m.toLowerCase() ] || m
	);
}
