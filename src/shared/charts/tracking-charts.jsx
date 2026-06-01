/**
 * TrackingCharts — lazy-loaded chart dashboard for the Pro Tracking tab.
 *
 * Default export so TrackingTab can React.lazy(() => import(...)) it, keeping
 * Chart.js in its own webpack chunk (Lite never loads it).
 *
 * Fetch strategy: range/bar → refetch /stats/timeseries (trend + breakdown);
 * range → refetch /stats/by-bar (comparison, all bars). audience/event are
 * client filters → applyFilters() over the cached series, no network.
 */
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import { __ } from '@wordpress/i18n';
import { ChartFilters } from './chart-filters';
import { TrendChart } from './trend-chart';
import { EventBreakdownChart } from './event-breakdown-chart';
import { BarComparisonChart } from './bar-comparison-chart';
import {
	applyFilters,
	EVENT_KEYS,
	seriesToCounters,
} from './timeseries-transform';

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

// Shimmer placeholder shown in each card while its data loads.
function ChartSkeleton() {
	return <div className="njt-chart-skeleton" aria-hidden="true" />;
}

function NoData() {
	return (
		<Status>{ __( 'No events match these filters.', 'notibar' ) }</Status>
	);
}

export default function TrackingCharts( { bars } ) {
	const [ filters, setFilters ] = useState( DEFAULT_FILTERS );
	const [ ts, setTs ] = useState( { status: 'loading', series: [] } );
	const [ barData, setBarData ] = useState( {
		status: 'loading',
		series: [],
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

	// Per-bar comparison: range-filtered server-side. Deliberately ignores the
	// bar filter (it's a cross-bar view); audience/event applied client-side.
	useEffect( () => {
		let cancelled = false;
		setBarData( ( prev ) => ( { ...prev, status: 'loading' } ) );

		const to = new Date();
		const from = new Date( Date.now() - filters.range * 86400000 );
		const path = addQueryArgs( '/notibar/v1/stats/by-bar', {
			from: ymdUtc( from ),
			to: ymdUtc( to ),
		} );

		apiFetch( { path } )
			.then( ( res ) => {
				if ( cancelled ) {
					return;
				}
				setBarData( {
					status: 'ok',
					series:
						res && Array.isArray( res.series ) ? res.series : [],
				} );
			} )
			.catch(
				() =>
					! cancelled && setBarData( { status: 'error', series: [] } )
			);

		return () => {
			cancelled = true;
		};
	}, [ filters.range ] );

	// Client filter (audience + events) — pure, no refetch.
	const viewSeries = useMemo(
		() => applyFilters( ts.series, filters.audience, filters.events ),
		[ ts.series, filters.audience, filters.events ]
	);
	const hasTrend = viewSeries.length > 0;

	// Comparison reuses the counters shape (via seriesToCounters) so it can
	// share BarComparisonChart + aggregateBarComparison.
	const barView = useMemo(
		() => applyFilters( barData.series, filters.audience, filters.events ),
		[ barData.series, filters.audience, filters.events ]
	);
	const barCounters = useMemo(
		() => seriesToCounters( barView ),
		[ barView ]
	);
	const hasBarData = barView.length > 0;

	return (
		<div className="njt-charts">
			<ChartFilters value={ filters } onChange={ patch } bars={ bars } />

			{ 'error' === ts.status ? (
				<Status>{ __( 'Chart data unavailable.', 'notibar' ) }</Status>
			) : (
				<div className="njt-charts__grid">
					<Card title={ __( 'Trend over time', 'notibar' ) }>
						{ 'loading' === ts.status && <ChartSkeleton /> }
						{ 'ok' === ts.status &&
							( hasTrend ? (
								<TrendChart series={ viewSeries } />
							) : (
								<NoData />
							) ) }
					</Card>

					<Card title={ __( 'Event breakdown', 'notibar' ) }>
						{ 'loading' === ts.status && <ChartSkeleton /> }
						{ 'ok' === ts.status &&
							( hasTrend ? (
								<EventBreakdownChart series={ viewSeries } />
							) : (
								<NoData />
							) ) }
					</Card>

					<Card
						title={ __( 'Per-bar comparison', 'notibar' ) }
						note={ __(
							'All bars, for the selected range and audience.',
							'notibar'
						) }
					>
						{ 'loading' === barData.status && <ChartSkeleton /> }
						{ 'error' === barData.status && (
							<Status>
								{ __( 'Stats unavailable.', 'notibar' ) }
							</Status>
						) }
						{ 'ok' === barData.status &&
							( hasBarData ? (
								<BarComparisonChart
									counters={ barCounters }
									bars={ bars }
								/>
							) : (
								<NoData />
							) ) }
					</Card>
				</div>
			) }
		</div>
	);
}
