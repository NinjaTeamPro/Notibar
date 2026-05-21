/**
 * Notibar Settings App — tabbed admin page root.
 *
 * Two tabs: Tracking (Phase 3 mount target) + Export / Import (Phase 4).
 * Uses WP-native nav-tab-wrapper styling; no router — local React state.
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TrackingTab } from './tabs/TrackingTab';
import { ExportImportTab } from './tabs/ExportImportTab';

const TABS = [
	{ id: 'tracking', label: __( 'Tracking', 'notibar' ) },
	{ id: 'export-import', label: __( 'Export / Import', 'notibar' ) },
];

/**
 * @param {Object} props
 * @param {Object} props.boot Boot data from window.njtNotibarSettingsBoot.
 */
export function App( { boot } ) {
	const [ activeTab, setActiveTab ] = useState( 'tracking' );

	function handleTabClick( e, id ) {
		e.preventDefault();
		setActiveTab( id );
	}

	return (
		<div className="njt-notibar-settings">
			<h1 className="wp-heading-inline">
				{ __( 'Notibar Settings', 'notibar' ) }
			</h1>

			<nav
				className="nav-tab-wrapper"
				aria-label={ __( 'Settings tabs', 'notibar' ) }
			>
				{ TABS.map( ( tab ) => (
					<a
						key={ tab.id }
						href={ `#${ tab.id }` }
						className={
							'nav-tab' +
							( activeTab === tab.id ? ' nav-tab-active' : '' )
						}
						aria-current={
							activeTab === tab.id ? 'page' : undefined
						}
						onClick={ ( e ) => handleTabClick( e, tab.id ) }
					>
						{ tab.label }
					</a>
				) ) }
			</nav>

			<div className="njt-notibar-settings__panel">
				{ activeTab === 'tracking' && <TrackingTab boot={ boot } /> }
				{ activeTab === 'export-import' && (
					<ExportImportTab boot={ boot } />
				) }
			</div>
		</div>
	);
}
