/**
 * BarComparisonChart — clicks/dismissals/engagements per bar (grouped bar).
 * Source: /stats lifetime counters. Always all-bars / all-time — the counters
 * store is not segmented by audience, so this chart is outside the filter bar.
 */
import { Bar } from 'react-chartjs-2';
import { __ } from '@wordpress/i18n';
import './chart-registry';
import { aggregateBarComparison, EVENT_COLORS } from './timeseries-transform';

const OPTIONS = {
	responsive: true,
	maintainAspectRatio: false,
	scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
	plugins: { legend: { position: 'bottom' } },
};

export function BarComparisonChart( { counters, bars } ) {
	const { labels, clicks, dismissals, engagements } = aggregateBarComparison(
		counters,
		bars,
		__( '(Untitled)', 'notibar' )
	);

	if ( 0 === labels.length ) {
		return null;
	}

	const data = {
		labels,
		datasets: [
			{
				label: __( 'Clicks', 'notibar' ),
				data: clicks,
				backgroundColor: EVENT_COLORS.click,
			},
			{
				label: __( 'Dismissals', 'notibar' ),
				data: dismissals,
				backgroundColor: EVENT_COLORS.dismiss,
			},
			{
				label: __( 'Engagements', 'notibar' ),
				data: engagements,
				backgroundColor: EVENT_COLORS.engage,
			},
		],
	};

	return (
		<div className="njt-chart__canvas">
			<Bar
				data={ data }
				options={ OPTIONS }
				aria-label={ __( 'Per-bar event comparison chart', 'notibar' ) }
			/>
		</div>
	);
}
