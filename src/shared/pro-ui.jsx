/**
 * Shared Pro upsell UI — edition helper + badge + upgrade notice.
 *
 * Lite keeps the Pro feature controls visible but locked; these helpers render
 * the badge/notice and tell callers which edition is active. In Pro
 * (isProEdition() === true) the notices are not rendered and controls stay live.
 *
 * The heavy Pro LOGIC (rotation engine, tracking backend) is still stripped from
 * the Lite build — this module only governs the locked control presentation.
 */
import { __ } from '@wordpress/i18n';

// Fallback used only if boot data omits the URL. The canonical source is the
// PHP constant NJT_NOFI_UPGRADE_URL, mirrored to boot.upgradeUrl by AssetLoader.
const UPGRADE_URL_FALLBACK =
	'https://ninjateam.org/notibar-wordpress-notification-bar/';

/**
 * Resolve the Pro upgrade URL from boot data (single source = PHP constant).
 *
 * @return {string}
 */
export function upgradeUrl() {
	const boot =
		window.njtNotibarBoot || window.njtNotibarSettingsBoot || {};
	return boot.upgradeUrl || UPGRADE_URL_FALLBACK;
}

/**
 * True when running the Pro edition. Reads the isPro flag emitted in boot data
 * (customizer: njtNotibarBoot, settings: njtNotibarSettingsBoot). Defaults to
 * true when no boot object is present (dev / unexpected context).
 *
 * @return {boolean}
 */
export function isProEdition() {
	const boot =
		window.njtNotibarBoot || window.njtNotibarSettingsBoot || {};
	return boot.isPro !== false;
}

/**
 * Small inline "PRO" pill.
 *
 * @return {JSX.Element}
 */
export function ProBadge() {
	return <span className="njt-pro-badge">{ __( 'PRO', 'notibar' ) }</span>;
}

/**
 * Upsell notice shown above a locked Pro feature.
 *
 * @param {Object} props
 * @param {string} props.feature Human label of the gated feature.
 * @return {JSX.Element}
 */
export function ProUpgradeNotice( { feature } ) {
	return (
		<div className="njt-pro-notice">
			<ProBadge />
			<span className="njt-pro-notice__text">{ feature }</span>
			<a
				className="njt-pro-notice__link"
				href={ upgradeUrl() }
				target="_blank"
				rel="noreferrer"
			>
				{ __( 'Upgrade to Pro →', 'notibar' ) }
			</a>
		</div>
	);
}
