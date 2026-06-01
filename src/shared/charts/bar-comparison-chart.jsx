/**
 * BarComparisonChart — clicks/dismissals/engagements per bar (grouped bar).
 * Fed a counters-shaped map by the parent (built from /stats/by-bar for the
 * selected range + audience). Always all bars — it ignores the bar filter
 * since comparing a single bar is meaningless.
 */
import { Bar } from 'react-chartjs-2';
import { __ } from '@wordpress/i18n';
import './chart-registry';
import { aggregateBarComparison, EVENT_COLORS } from './timeseries-transform';

// Axis labels are user-authored bar names that can be long; cap what the axis
// draws. The data keeps the full name, so the tooltip still shows it in full.
const MAX_LABEL = 16;

const OPTIONS = {
	responsive: true,
	maintainAspectRatio: false,
	scales: {
		x: {
			ticks: {
				maxRotation: 0,
				autoSkip: false,
				// `this` is the scale — must be a normal function, not an arrow.
				callback( value ) {
					const label = this.getLabelForValue( value );
					return label.length > MAX_LABEL
						? label.slice( 0, MAX_LABEL ) + '…'
						: label;
				},
			},
		},
		y: { beginAtZero: true, ticks: { precision: 0 } },
	},
	plugins: {
		legend: { position: 'bottom' },
		// Tooltip title = the full, untruncated bar name.
		tooltip: { callbacks: { title: ( items ) => items[ 0 ]?.label ?? '' } },
	},
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
