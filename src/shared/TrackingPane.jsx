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
 * @since 3.1.0
 */
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

export function TrackingPane( { bars } ) {
	const [ state, setState ] = useState( { status: 'loading' } );

	useEffect( () => {
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
	}, [] );

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

	if ( ! bars || 0 === bars.length ) {
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
					{ bars.map( ( bar ) => {
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
