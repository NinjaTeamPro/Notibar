/**
 * TrackingPane — aggregate per-bar click + dismiss readout.
 *
 * Rendered inside the Notibar SPA Panel (list mode), below Display Settings.
 * Lifecycle: parent unmounts this component when the PanelBody is collapsed
 * and remounts on expand — that gives natural "open = fresh fetch" UX.
 *
 * Data source: GET /notibar/v1/stats — admin-gated bulk-read of the
 * notibar_counters option. Joins counters map with the SPA's in-memory
 * bars list (passed via prop) to render bar.name for each row.
 *
 * demo mode: when `demo` is true the component skips the REST fetch and
 * renders sample data — used by the Lite "Go Pro" tracking teaser so users
 * can see the report layout without a tracking backend.
 *
 * @since 3.1.0
 */
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

// Sample dataset for the Lite teaser (demo mode).
const DEMO_BARS = [
	{ id: 'demo-1', name: 'Summer Sale Banner' },
	{ id: 'demo-2', name: 'Free Shipping Notice' },
	{ id: 'demo-3', name: 'Newsletter Signup' },
];
const DEMO_COUNTERS = {
	'demo-1': { engagements: 842, clicks: 1284, dismissals: 173 },
	'demo-2': { engagements: 415, clicks: 902, dismissals: 88 },
	'demo-3': { engagements: 1267, clicks: 564, dismissals: 240 },
};

export function TrackingPane( { bars, demo = false } ) {
	const [ state, setState ] = useState(
		demo ? { status: 'ok', data: DEMO_COUNTERS } : { status: 'loading' }
	);

	useEffect( () => {
		// Demo teaser — never hits the backend (which Lite does not ship).
		if ( demo ) {
			return undefined;
		}

		let cancelled = false;

		apiFetch( { path: '/notibar/v1/stats' } )
			.then( ( data ) => {
				if ( cancelled ) {
					return;
				}
				setState( {
					status: 'ok',
					data: data && 'object' === typeof data ? data : {},
				} );
			} )
			.catch( () => {
				if ( cancelled ) {
					return;
				}
				setState( { status: 'error' } );
			} );

		return () => {
			cancelled = true;
		};
	}, [ demo ] );

	const rowBars = demo ? DEMO_BARS : bars;

	if ( 'loading' === state.status ) {
		return (
			<p
				className="njt-notibar-tracking-pane__status"
				role="status"
				aria-live="polite"
			>
				{ __( 'Loading stats…', 'notibar' ) }
			</p>
		);
	}

	if ( 'error' === state.status ) {
		return (
			<p
				className="njt-notibar-tracking-pane__status"
				role="status"
				aria-live="polite"
			>
				{ __( 'Stats unavailable.', 'notibar' ) }
			</p>
		);
	}

	if ( ! rowBars || 0 === rowBars.length ) {
		return (
			<p className="njt-notibar-tracking-pane__status">
				{ __( 'No notification bars configured yet.', 'notibar' ) }
			</p>
		);
	}

	const counters = state.data || {};

	return (
		<div className="njt-notibar-tracking-pane">
			<table className="njt-notibar-tracking-pane__table">
				<thead>
					<tr>
						<th scope="col">{ __( 'Bar', 'notibar' ) }</th>
						<th scope="col" className="num">
							{ __( 'Engagements', 'notibar' ) }
						</th>
						<th scope="col" className="num">
							{ __( 'Button Clicks', 'notibar' ) }
						</th>
						<th scope="col" className="num">
							{ __( 'Dismissals', 'notibar' ) }
						</th>
						<th scope="col" className="num">
							{ __( 'Total', 'notibar' ) }
						</th>
					</tr>
				</thead>
				<tbody>
					{ rowBars.map( ( bar ) => {
						const row = counters[ bar.id ] || {};
						const engagements = Number( row.engagements ) || 0;
						const clicks = Number( row.clicks ) || 0;
						const dismissals = Number( row.dismissals ) || 0;
						const total = engagements + clicks + dismissals;
						const name =
							bar.name && bar.name.trim().length
								? bar.name
								: __( '(Untitled)', 'notibar' );
						return (
							<tr key={ bar.id }>
								<td>{ name }</td>
								<td className="num">
									{ engagements.toLocaleString() }
								</td>
								<td className="num">
									{ clicks.toLocaleString() }
								</td>
								<td className="num">
									{ dismissals.toLocaleString() }
								</td>
								<td className="num">
									{ total.toLocaleString() }
								</td>
							</tr>
						);
					} ) }
				</tbody>
			</table>
			<div className="njt-notibar-tracking-pane__hint">
				<p>
					{ __(
						'Engagements = clicks or text copies inside the bar that are NOT on the CTA button or the close button (background clicks, text clicks, embedded link clicks, copying coupon codes, etc.).',
						'notibar'
					) }
				</p>
				<p>
					{ __(
						'Counts since plugin activation; reload to refresh.',
						'notibar'
					) }
				</p>
			</div>
		</div>
	);
}
