/**
 * TrendChart — daily counts per event type over the selected range (line/area).
 * Source: filtered /stats/timeseries series.
 */
import { Line } from 'react-chartjs-2';
import { __ } from '@wordpress/i18n';
import './chart-registry';
import { aggregateTrend, EVENT_COLORS } from './timeseries-transform';

const EVENT_LABELS = {
	click: __( 'Clicks', 'notibar' ),
	dismiss: __( 'Dismissals', 'notibar' ),
	engage: __( 'Engagements', 'notibar' ),
};

const OPTIONS = {
	responsive: true,
	maintainAspectRatio: false,
	interaction: { mode: 'index', intersect: false },
	scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
	plugins: { legend: { position: 'bottom' } },
};

export function TrendChart( { series } ) {
	const { dates, byEvent } = aggregateTrend( series );
	const labels = EVENT_LABELS;

	// One dataset per event that actually has data in the (filtered) range.
	const datasets = Object.keys( byEvent )
		.filter( ( key ) => byEvent[ key ].some( ( n ) => n > 0 ) )
		.map( ( key ) => ( {
			label: labels[ key ],
			data: byEvent[ key ],
			borderColor: EVENT_COLORS[ key ],
			backgroundColor: EVENT_COLORS[ key ] + '22', // ~13% alpha fill
			fill: true,
			tension: 0.3,
			pointRadius: 2,
		} ) );

	if ( 0 === datasets.length ) {
		return null;
	}

	return (
		<div className="njt-chart__canvas">
			<Line
				data={ { labels: dates, datasets } }
				options={ OPTIONS }
				aria-label={ __( 'Daily event trend chart', 'notibar' ) }
			/>
		</div>
	);
}
