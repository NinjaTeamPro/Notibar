/**
 * TrackingTab — renders the shared TrackingPane inside the Settings page.
 *
 * Reads bars from window.njtNotibarSettingsBoot (emitted by
 * AssetLoader::enqueue_settings_app). TrackingPane self-fetches its
 * counters via /notibar/v1/stats and joins them against the bars list.
 *
 * Lite: the tracking REST backend is stripped, so render an upgrade teaser
 * instead of mounting TrackingPane (which would fetch a missing endpoint).
 */
import { lazy, Suspense } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TrackingPane } from '../../shared/TrackingPane';
import { isProEdition, ProUpgradeNotice } from '../../shared/pro-ui';

// Lazy so Chart.js ships in its own chunk — only requested when a Pro user
// opens this tab. Lite (teaser branch) never reaches this import.
const TrackingCharts = lazy( () =>
	import( '../../shared/charts/tracking-charts' )
);

export function TrackingTab() {
	const boot = window.njtNotibarSettingsBoot || {};
	const bars = Array.isArray( boot.bars ) ? boot.bars : [];

	if ( ! isProEdition() ) {
		// Show the upgrade gateway + a locked preview of the real report (sample
		// data) so users can see what they get before upgrading.
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
					<TrackingPane demo />
				</div>
			</div>
		);
	}

	return (
		<>
			<Suspense
				fallback={
					// Skeleton while the chart chunk loads. Plain div + global
					// class (njt-chart-skeleton lives in settings-app.css) so the
					// fallback pulls nothing from the lazy chunk.
					<div
						className="njt-charts"
						role="status"
						aria-label={ __( 'Loading charts…', 'notibar' ) }
					>
						<div
							className="njt-chart-skeleton"
							aria-hidden="true"
						/>
					</div>
				}
			>
				<TrackingCharts bars={ bars } />
			</Suspense>
			<TrackingPane bars={ bars } />
		</>
	);
}
