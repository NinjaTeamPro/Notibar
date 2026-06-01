/**
 * ChartFilters — the tracking charts filter bar (controlled).
 *
 * Range + bar are server filters (parent refetches /stats/timeseries on
 * change). Audience + event type are client filters (parent re-transforms the
 * already-fetched series — no network). The parent owns all state; this is a
 * presentational controlled component.
 */
import { Button, SelectControl } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { EVENT_KEYS } from './timeseries-transform';

// 0 = today only (from === to); the rest are trailing-day windows.
const RANGES = [ 0, 7, 30, 90 ];

const rangeLabel = ( days ) =>
	0 === days
		? __( 'Today', 'notibar' )
		: sprintf(
				/* translators: %d: number of days. */
				__( '%d days', 'notibar' ),
				days
		  );
const AUDIENCES = [ 'all', 'guest', 'member' ];

const audienceLabel = ( key ) => {
	switch ( key ) {
		case 'guest':
			return __( 'Guests', 'notibar' );
		case 'member':
			return __( 'Logged-in', 'notibar' );
		default:
			return __( 'All visitors', 'notibar' );
	}
};

const eventLabel = ( key ) => {
	switch ( key ) {
		case 'click':
			return __( 'Clicks', 'notibar' );
		case 'dismiss':
			return __( 'Dismissals', 'notibar' );
		case 'engage':
			return __( 'Engagements', 'notibar' );
		default:
			return key; // surface unexpected keys instead of mislabeling
	}
};

export function ChartFilters( { value, onChange, bars } ) {
	const { range, barId, audience, events } = value;

	const barOptions = [
		{ label: __( 'All bars', 'notibar' ), value: '' },
		...( Array.isArray( bars ) ? bars : [] ).map( ( bar ) => ( {
			label:
				bar.name && bar.name.trim().length
					? bar.name
					: __( '(Untitled)', 'notibar' ),
			value: bar.id,
		} ) ),
	];

	// Toggle an event key while guaranteeing at least one stays selected.
	const toggleEvent = ( key ) => {
		const next = events.includes( key )
			? events.filter( ( e ) => e !== key )
			: [ ...events, key ];
		if ( next.length ) {
			onChange( { events: next } );
		}
	};

	return (
		<div className="njt-chart-filters">
			<div
				className="njt-chart-filters__group"
				role="group"
				aria-label={ __( 'Date range', 'notibar' ) }
			>
				<span className="njt-chart-filters__label">
					{ __( 'Range', 'notibar' ) }
				</span>
				{ RANGES.map( ( days ) => (
					<Button
						key={ days }
						variant={ range === days ? 'primary' : 'secondary' }
						isPressed={ range === days }
						onClick={ () => onChange( { range: days } ) }
					>
						{ rangeLabel( days ) }
					</Button>
				) ) }
			</div>

			<div className="njt-chart-filters__group">
				<SelectControl
					label={ __( 'Bar', 'notibar' ) }
					value={ barId }
					options={ barOptions }
					onChange={ ( v ) => onChange( { barId: v } ) }
					__nextHasNoMarginBottom
				/>
			</div>

			<div
				className="njt-chart-filters__group"
				role="group"
				aria-label={ __( 'Audience', 'notibar' ) }
			>
				<span className="njt-chart-filters__label">
					{ __( 'Audience', 'notibar' ) }
				</span>
				{ AUDIENCES.map( ( key ) => (
					<Button
						key={ key }
						variant={ audience === key ? 'primary' : 'secondary' }
						isPressed={ audience === key }
						onClick={ () => onChange( { audience: key } ) }
					>
						{ audienceLabel( key ) }
					</Button>
				) ) }
			</div>

			<div
				className="njt-chart-filters__group"
				role="group"
				aria-label={ __( 'Event types', 'notibar' ) }
			>
				<span className="njt-chart-filters__label">
					{ __( 'Events', 'notibar' ) }
				</span>
				{ EVENT_KEYS.map( ( key ) => (
					<Button
						key={ key }
						variant={
							events.includes( key ) ? 'primary' : 'secondary'
						}
						isPressed={ events.includes( key ) }
						onClick={ () => toggleEvent( key ) }
					>
						{ eventLabel( key ) }
					</Button>
				) ) }
			</div>
		</div>
	);
}
