/**
 * Notibar — Per-bar cookie management.
 *
 * Each dismissed bar gets its own cookie: njt-notibar-{id}=1
 * TTL is driven by bar.behavior.reopenAfterDays.
 * A value of 0 means session cookie (no Max-Age).
 *
 * @since 3.0.0
 */
/* eslint-env browser */

/** @type {string} */
export const COOKIE_PREFIX = 'njt-notibar-';

/**
 * Check whether the given bar ID has a dismissal cookie set.
 *
 * @param {string|number} id Bar ID.
 * @return {boolean} true if the bar is dismissed.
 */
export function isDismissed( id ) {
	const needle = COOKIE_PREFIX + String( id ) + '=';
	return document.cookie
		.split( '; ' )
		.some( ( c ) => c.startsWith( needle ) );
}

/**
 * Set the dismissal cookie for the given bar.
 *
 * @param {string|number} id   Bar ID.
 * @param {number}        days Number of days to keep cookie. 0 = session cookie.
 * @return {void}
 */
export function dismiss( id, days ) {
	const safeDays = Math.max( 0, Number( days ) || 0 );
	const maxAge = safeDays > 0 ? `; Max-Age=${ safeDays * 86400 }` : '';
	const secure = location.protocol === 'https:' ? '; Secure' : '';
	document.cookie = `${ COOKIE_PREFIX }${ String(
		id
	) }=1; Path=/; SameSite=Lax${ maxAge }${ secure }`;
}
