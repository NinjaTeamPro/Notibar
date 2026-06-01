/**
 * Sample datasets for the Lite locked charts preview (demo mode). Shapes match
 * the real /stats/timeseries and /stats/by-bar series so the same components +
 * transforms render them with no REST calls. Bar names mirror TrackingPane's
 * DEMO_BARS so the preview is internally consistent.
 */

// Bars referenced by the by-bar demo (id + display name).
export const DEMO_BARS = [
	{ id: 'demo-1', name: 'Summer Sale Banner' },
	{ id: 'demo-2', name: 'Free Shipping Notice' },
	{ id: 'demo-3', name: 'Newsletter Signup' },
];

// Time-series demo (trend + breakdown): a week of mixed events/audiences.
export const DEMO_TIMESERIES = [
	{ date: '2026-05-26', event: 'click', is_logged_in: 0, count: 9 },
	{ date: '2026-05-26', event: 'dismiss', is_logged_in: 0, count: 4 },
	{ date: '2026-05-26', event: 'engage', is_logged_in: 0, count: 15 },
	{ date: '2026-05-27', event: 'click', is_logged_in: 1, count: 7 },
	{ date: '2026-05-27', event: 'engage', is_logged_in: 0, count: 18 },
	{ date: '2026-05-28', event: 'click', is_logged_in: 0, count: 12 },
	{ date: '2026-05-28', event: 'dismiss', is_logged_in: 1, count: 3 },
	{ date: '2026-05-29', event: 'click', is_logged_in: 0, count: 10 },
	{ date: '2026-05-29', event: 'engage', is_logged_in: 1, count: 22 },
	{ date: '2026-05-30', event: 'click', is_logged_in: 0, count: 14 },
	{ date: '2026-05-30', event: 'dismiss', is_logged_in: 0, count: 5 },
	{ date: '2026-05-31', event: 'engage', is_logged_in: 0, count: 19 },
	{ date: '2026-06-01', event: 'click', is_logged_in: 1, count: 11 },
	{ date: '2026-06-01', event: 'engage', is_logged_in: 0, count: 25 },
];

// Per-bar demo (comparison): three bars with click/dismiss/engage totals.
export const DEMO_BY_BAR = [
	{ bar_id: 'demo-1', event: 'click', is_logged_in: 0, count: 84 },
	{ bar_id: 'demo-1', event: 'dismiss', is_logged_in: 0, count: 17 },
	{ bar_id: 'demo-1', event: 'engage', is_logged_in: 0, count: 56 },
	{ bar_id: 'demo-2', event: 'click', is_logged_in: 0, count: 61 },
	{ bar_id: 'demo-2', event: 'dismiss', is_logged_in: 1, count: 9 },
	{ bar_id: 'demo-2', event: 'engage', is_logged_in: 0, count: 33 },
	{ bar_id: 'demo-3', event: 'click', is_logged_in: 1, count: 38 },
	{ bar_id: 'demo-3', event: 'engage', is_logged_in: 0, count: 72 },
	{ bar_id: 'demo-3', event: 'dismiss', is_logged_in: 0, count: 14 },
];
