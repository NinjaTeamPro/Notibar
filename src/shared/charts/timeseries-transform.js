/**
 * Pure transforms for the tracking charts. No React, no Chart.js — just data
 * reshaping so this stays unit-testable. Chart-config (i18n labels, options)
 * lives in the chart wrapper components.
 *
 * `/stats/timeseries` series row shape: { date, event, is_logged_in, count }.
 * `/stats` counters shape: { <bar_id>: { clicks, dismissals, engagements } }.
 */

// Canonical event order + admin-palette colors (not i18n — display labels are
// applied with __() in the components).
export const EVENT_KEYS = [ 'click', 'dismiss', 'engage' ];
export const EVENT_COLORS = {
	click: '#3858e9', // brand accent (admin)
	dismiss: '#d63638', // WP admin red
	engage: '#00a32a', // WP admin green
};

/**
 * Filter a timeseries by audience + allowed event set (client-side).
 *
 * @param {Array}  series   Raw series rows.
 * @param {string} audience 'all' | 'guest' | 'member'.
 * @param {Array}  events   Allowed event keys (subset of EVENT_KEYS).
 * @return {Array} Filtered rows.
 */
export function applyFilters( series, audience, events ) {
	if ( ! Array.isArray( series ) ) {
		return [];
	}
	const allowed = Array.isArray( events ) ? events : EVENT_KEYS;
	return series.filter( ( row ) => {
		if ( ! allowed.includes( row.event ) ) {
			return false;
		}
		if ( 'guest' === audience && 0 !== Number( row.is_logged_in ) ) {
			return false;
		}
		if ( 'member' === audience && 1 !== Number( row.is_logged_in ) ) {
			return false;
		}
		return true;
	} );
}

/**
 * Aggregate series into per-date counts per event (summed over is_logged_in).
 *
 * @param {Array} series Filtered series rows.
 * @return {{dates: string[], byEvent: Object}} Dates sorted asc; byEvent[key]
 *         is a count array aligned to dates.
 */
export function aggregateTrend( series ) {
	const rows = Array.isArray( series ) ? series : [];
	const dates = [ ...new Set( rows.map( ( r ) => r.date ) ) ].sort();
	const index = new Map( dates.map( ( d, i ) => [ d, i ] ) );

	const byEvent = {};
	EVENT_KEYS.forEach( ( k ) => {
		byEvent[ k ] = new Array( dates.length ).fill( 0 );
	} );

	rows.forEach( ( r ) => {
		if ( ! byEvent[ r.event ] || ! index.has( r.date ) ) {
			return;
		}
		byEvent[ r.event ][ index.get( r.date ) ] += Number( r.count ) || 0;
	} );

	return { dates, byEvent };
}

/**
 * Totals per event across the whole (filtered) series — for the doughnut.
 *
 * @param {Array} series Filtered series rows.
 * @return {Object} { click, dismiss, engage } totals.
 */
export function aggregateBreakdown( series ) {
	const rows = Array.isArray( series ) ? series : [];
	const totals = { click: 0, dismiss: 0, engage: 0 };
	rows.forEach( ( r ) => {
		if ( undefined !== totals[ r.event ] ) {
			totals[ r.event ] += Number( r.count ) || 0;
		}
	} );
	return totals;
}

/**
 * Build a per-bar counters map from a /stats/by-bar series so the comparison
 * chart can reuse aggregateBarComparison() (which expects the counters shape).
 * Pass the series through applyFilters() first to honour audience/event.
 *
 * @param {Array} series by-bar rows: { bar_id, event, is_logged_in, count }.
 * @return {Object} { <bar_id>: { clicks, dismissals, engagements } }.
 */
export function seriesToCounters( series ) {
	const rows = Array.isArray( series ) ? series : [];
	const keyFor = {
		click: 'clicks',
		dismiss: 'dismissals',
		engage: 'engagements',
	};
	const map = {};
	rows.forEach( ( r ) => {
		const key = keyFor[ r.event ];
		if ( ! key ) {
			return;
		}
		if ( ! map[ r.bar_id ] ) {
			map[ r.bar_id ] = { clicks: 0, dismissals: 0, engagements: 0 };
		}
		map[ r.bar_id ][ key ] += Number( r.count ) || 0;
	} );
	return map;
}

/**
 * Per-bar lifetime totals from the aggregate counters, aligned to the bars
 * list (so charts show bar names, not ids). Always all bars / all time —
 * the counters store is not segmented by audience.
 *
 * @param {Object} counters      /stats map keyed by bar_id.
 * @param {Array}  bars          [{ id, name }].
 * @param {string} untitledLabel Fallback label for unnamed bars (caller passes
 *                               a translated string; pure file can't use __()).
 * @return {{labels: string[], clicks: number[], dismissals: number[], engagements: number[]}}
 *         Parallel arrays aligned to `bars`: display labels + per-event totals.
 */
export function aggregateBarComparison(
	counters,
	bars,
	untitledLabel = '(Untitled)'
) {
	const map = counters && 'object' === typeof counters ? counters : {};
	const list = Array.isArray( bars ) ? bars : [];

	const labels = [];
	const clicks = [];
	const dismissals = [];
	const engagements = [];

	list.forEach( ( bar ) => {
		const row = map[ bar.id ] || {};
		labels.push(
			bar.name && bar.name.trim().length ? bar.name : untitledLabel
		);
		clicks.push( Number( row.clicks ) || 0 );
		dismissals.push( Number( row.dismissals ) || 0 );
		engagements.push( Number( row.engagements ) || 0 );
	} );

	return { labels, clicks, dismissals, engagements };
}
