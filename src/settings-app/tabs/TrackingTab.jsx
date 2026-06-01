/**
 * TrackingTab — the Settings-page tracking dashboard.
 *
 * Reads bars from window.njtNotibarSettingsBoot (emitted by
 * AssetLoader::enqueue_settings_app). The dashboard = filtered charts
 * (TrackingCharts) + the all-time per-bar totals table (TrackingPane).
 *
 * Lite: the tracking REST backend is stripped, so render the SAME dashboard in
 * `demo` mode (canned sample data, no REST) behind a locked upgrade gateway, so
 * users see exactly what Pro unlocks.
 */
import { lazy, Suspense } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TrackingPane } from '../../shared/TrackingPane';
import { isProEdition, ProUpgradeNotice } from '../../shared/pro-ui';

// Lazy so Chart.js ships in its own chunk — requested only when the Tracking
// tab is opened (Pro or the Lite locked preview).
const TrackingCharts = lazy( () =>
	import( '../../shared/charts/tracking-charts' )
);

// Skeleton while the lazy chart chunk downloads. Plain div + global class
// (njt-chart-skeleton lives in settings-app.css) so it pulls nothing from the
// not-yet-loaded chunk.
function ChartsFallback() {
	return (
		<div
			className="njt-charts"
			role="status"
			aria-label={ __( 'Loading charts…', 'notibar' ) }
		>
			<div className="njt-chart-skeleton" aria-hidden="true" />
		</div>
	);
}

// Full dashboard: filtered charts + the all-time per-bar table. `demo` drives
// the Lite locked preview (sample data, no REST).
function Dashboard( { bars, demo = false } ) {
	return (
		<>
			<Suspense fallback={ <ChartsFallback /> }>
				<TrackingCharts bars={ bars } demo={ demo } />
			</Suspense>

			<section className="njt-alltime">
				<div className="njt-alltime__head">
					<h3 className="njt-alltime__title">
						{ __( 'Per-bar totals', 'notibar' ) }
					</h3>
					<span className="njt-alltime__badge">
						{ __( 'All time', 'notibar' ) }
					</span>
				</div>
				<p className="njt-alltime__sub">
					{ __(
						'Lifetime totals across all bars, independent of the filters above.',
						'notibar'
					) }
				</p>
				<TrackingPane bars={ bars } demo={ demo } />
			</section>
		</>
	);
}

export function TrackingTab() {
	const boot = window.njtNotibarSettingsBoot || {};
	const bars = Array.isArray( boot.bars ) ? boot.bars : [];

	if ( ! isProEdition() ) {
		// Upgrade gateway + a locked preview of the full dashboard (sample data)
		// so Lite users see exactly what Pro unlocks.
		return (
			<div className="njt-tracking-teaser">
				<ProUpgradeNotice
					feature={ __(
						'Advanced reports — per-bar click & dismiss tracking',
						'notibar'
					) }
				/>
				<p className="njt-tracking-teaser__caption">
					{ __(
						'Preview with sample data — upgrade to Pro to track your own bars.',
						'notibar'
					) }
				</p>
				<div className="njt-pro-locked" aria-hidden="true">
					<Dashboard demo />
				</div>
			</div>
		);
	}

	return <Dashboard bars={ bars } />;
}
