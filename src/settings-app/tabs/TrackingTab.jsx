/**
 * TrackingTab — renders the shared TrackingPane inside the Settings page.
 *
 * Reads bars from window.njtNotibarSettingsBoot (emitted by
 * AssetLoader::enqueue_settings_app). TrackingPane self-fetches its
 * counters via /notibar/v1/stats and joins them against the bars list.
 */
import { TrackingPane } from '../../shared/TrackingPane';

export function TrackingTab() {
	const boot = window.njtNotibarSettingsBoot || {};
	const bars = Array.isArray( boot.bars ) ? boot.bars : [];
	return <TrackingPane bars={ bars } />;
}
