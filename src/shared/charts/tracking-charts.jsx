/**
 * TrackingCharts — lazy-loaded chart dashboard for the Pro Tracking tab.
 *
 * Default export so TrackingTab can React.lazy(() => import(...)) it, keeping
 * Chart.js in its own webpack chunk (Lite never loads it).
 *
 * Fetch strategy: range/bar are server filters → refetch /stats/timeseries on
 * change; audience/event are client filters → applyFilters() over the cached
 * series, no network. /stats (per-bar lifetime) is fetched once.
 */
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { ChartFilters } from './chart-filters';
import { TrendChart } from './trend-chart';
import { EventBreakdownChart } from './event-breakdown-chart';
import { BarComparisonChart } from './bar-comparison-chart';
import { applyFilters, EVENT_KEYS } from './timeseries-transform';

const ymdUtc = ( date ) => date.toISOString().slice( 0, 10 );

const DEFAULT_FILTERS = {
	range: 30,
	barId: '',
	audience: 'all',
	events: EVENT_KEYS,
};

function Status( { children } ) {
	return (
		<p className="njt-charts__status" role="status" aria-live="polite">
			{ children }
		</p>
	);
}

function Card( { title, note, children } ) {
	return (
		<section className="njt-charts__card">
			<h3 className="njt-charts__card-title">{ title }</h3>
			{ note && <p className="njt-charts__card-note">{ note }</p> }
			{ children }
		</section>
	);
}

export default function TrackingCharts( { bars } ) {
	const [ filters, setFilters ] = useState( DEFAULT_FILTERS );
	const [ ts, setTs ] = useState( { status: 'loading', series: [] } );
	const [ counters, setCounters ] = useState( {
		status: 'loading',
		data: {},
	} );

	const patch = ( next ) =>
		setFilters( ( prev ) => ( { ...prev, ...next } ) );

	// Server-filtered fetch: only range + bar hit the network.
	useEffect( () => {
		let cancelled = false;
		setTs( ( prev ) => ( { ...prev, status: 'loading' } ) );

		const to = new Date();
		const from = new Date( Date.now() - filters.range * 86400000 );
		const path = addQueryArgs( '/notibar/v1/stats/timeseries', {
			from: ymdUtc( from ),
			to: ymdUtc( to ),
			...( filters.barId ? { bar_id: filters.barId } : {} ),
		} );

		apiFetch( { path } )
			.then( ( res ) => {
				if ( cancelled ) {
					return;
				}
				setTs( {
					status: 'ok',
					series:
						res && Array.isArray( res.series ) ? res.series : [],
				} );
			} )
			.catch(
				() => ! cancelled && setTs( { status: 'error', series: [] } )
			);

		return () => {
			cancelled = true;
		};
	}, [ filters.range, filters.barId ] );

	// Per-bar lifetime counters — fetched once for the comparison chart.
	useEffect( () => {
		let cancelled = false;
		apiFetch( { path: '/notibar/v1/stats' } )
			.then( ( data ) => {
				if ( cancelled ) {
					return;
				}
				setCounters( {
					status: 'ok',
					data: data && 'object' === typeof data ? data : {},
				} );
			} )
			.catch(
				() =>
					! cancelled && setCounters( { status: 'error', data: {} } )
			);
		return () => {
			cancelled = true;
		};
	}, [] );

	// Client filter (audience + events) — pure, no refetch.
	const viewSeries = useMemo(
		() => applyFilters( ts.series, filters.audience, filters.events ),
		[ ts.series, filters.audience, filters.events ]
	);
	const hasTrend = viewSeries.length > 0;

	return (
		<div className="njt-charts">
			<ChartFilters value={ filters } onChange={ patch } bars={ bars } />

			{ 'loading' === ts.status && (
				<Status>{ __( 'Loading charts…', 'notibar' ) }</Status>
			) }
			{ 'error' === ts.status && (
				<Status>{ __( 'Chart data unavailable.', 'notibar' ) }</Status>
			) }

			{ 'ok' === ts.status && (
				<div className="njt-charts__grid">
					<Card title={ __( 'Trend over time', 'notibar' ) }>
						{ hasTrend ? (
							<TrendChart series={ viewSeries } />
						) : (
							<Status>
								{ __(
									'No events match these filters.',
									'notibar'
								) }
							</Status>
						) }
					</Card>

					<Card title={ __( 'Event breakdown', 'notibar' ) }>
						{ hasTrend ? (
							<EventBreakdownChart series={ viewSeries } />
						) : (
							<Status>
								{ __(
									'No events match these filters.',
									'notibar'
								) }
							</Status>
						) }
					</Card>

					<Card
						title={ __( 'Per-bar comparison', 'notibar' ) }
						note={ __(
							'All bars, all-time totals (not affected by the filters above).',
							'notibar'
						) }
					>
						{ 'ok' !== counters.status ? (
							<Status>
								{ 'error' === counters.status
									? __( 'Stats unavailable.', 'notibar' )
									: __( 'Loading…', 'notibar' ) }
							</Status>
						) : (
							<BarComparisonChart
								counters={ counters.data }
								bars={ bars }
							/>
						) }
					</Card>
				</div>
			) }
		</div>
	);
}
