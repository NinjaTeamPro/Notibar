/**
 * BarEditor — 4-tab bar editor using @wordpress/components TabPanel.
 *
 * Tabs: Content | Style | Display | Behavior
 *
 * Props:
 *   bar      {Object}   The bar object being edited.
 *   onChange {Function} Called with the fully updated bar object.
 *
 * Each tab receives bar + onChange and uses updatePath() for immutable updates.
 * The parent (App) handles debounced write to wp.customize.
 */
import { TabPanel } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ContentTab } from './tabs/ContentTab';
import { StyleTab } from './tabs/StyleTab';
import { DisplayTab } from './tabs/DisplayTab';
import { BehaviorTab } from './tabs/BehaviorTab';

const TAB_MAP = {
	content: ContentTab,
	style: StyleTab,
	display: DisplayTab,
	behavior: BehaviorTab,
};

const TABS = [
	{
		name: 'content',
		title: __( 'Content', 'notibar' ),
		className: 'njt-notibar-tab njt-notibar-tab--content',
	},
	{
		name: 'style',
		title: __( 'Style', 'notibar' ),
		className: 'njt-notibar-tab njt-notibar-tab--style',
	},
	{
		name: 'display',
		title: __( 'Display', 'notibar' ),
		className: 'njt-notibar-tab njt-notibar-tab--display',
	},
	{
		name: 'behavior',
		title: __( 'Behavior', 'notibar' ),
		className: 'njt-notibar-tab njt-notibar-tab--behavior',
	},
];

export function BarEditor( { bar, onChange } ) {
	return (
		<div className="njt-notibar-bar-editor">
			<TabPanel
				className="njt-notibar-editor-tabs"
				activeClass="is-active"
				tabs={ TABS }
				initialTabName="content"
			>
				{ ( tab ) => {
					const Tab = TAB_MAP[ tab.name ];
					return <Tab bar={ bar } onChange={ onChange } />;
				} }
			</TabPanel>
		</div>
	);
}
