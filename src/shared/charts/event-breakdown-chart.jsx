/**
 * EventBreakdownChart — click vs dismiss vs engage share for the filtered
 * range/bar/audience (doughnut). Source: filtered /stats/timeseries series.
 */
import { Doughnut } from 'react-chartjs-2';
import { __ } from '@wordpress/i18n';
import './chart-registry';
import { aggregateBreakdown, EVENT_COLORS } from './timeseries-transform';

const OPTIONS = {
	responsive: true,
	maintainAspectRatio: false,
	plugins: { legend: { position: 'bottom' } },
};

export function EventBreakdownChart( { series } ) {
	const totals = aggregateBreakdown( series );
	const labelMap = {
		click: __( 'Clicks', 'notibar' ),
		dismiss: __( 'Dismissals', 'notibar' ),
		engage: __( 'Engagements', 'notibar' ),
	};

	// Keep only events with a non-zero share so the doughnut is meaningful.
	const keys = Object.keys( totals ).filter( ( k ) => totals[ k ] > 0 );
	if ( 0 === keys.length ) {
		return null;
	}

	const data = {
		labels: keys.map( ( k ) => labelMap[ k ] ),
		datasets: [
			{
				data: keys.map( ( k ) => totals[ k ] ),
				backgroundColor: keys.map( ( k ) => EVENT_COLORS[ k ] ),
				borderWidth: 1,
			},
		],
	};

	return (
		<div className="njt-chart__canvas">
			<Doughnut
				data={ data }
				options={ OPTIONS }
				aria-label={ __( 'Event type breakdown chart', 'notibar' ) }
			/>
		</div>
	);
}
