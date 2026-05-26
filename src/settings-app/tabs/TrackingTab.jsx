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
import { __ } from '@wordpress/i18n';
import { TrackingPane } from '../../shared/TrackingPane';
import { isProEdition, ProUpgradeNotice } from '../../shared/pro-ui';

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

	return <TrackingPane bars={ bars } />;
}
