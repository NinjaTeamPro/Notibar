/**
 * DisplayTab — Display tab inside BarEditor.
 *
 * Fields:
 *   - Device checkboxes (Desktop, Mobile)
 *   - Page logic: 4-state RadioControl (all|none|include|exclude)
 *   - Page picker: AsyncPostPicker shown only when logic ∈ {include, exclude}
 *   - Post logic: 4-state RadioControl (all|none|include|exclude)
 *   - Post picker: AsyncPostPicker shown only when logic ∈ {include, exclude}
 *   - Other post types (CPT) block: see DisplayTabCptBlock.
 */
import { CheckboxControl, RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { AsyncPostPicker } from '../fields/AsyncPostPicker';
import { DisplayTabCptBlock } from './DisplayTabCptBlock';
import { DisplayTabAudienceBlock } from './DisplayTabAudienceBlock';

const PAGE_LOGIC_OPTIONS = [
	{
		value: 'all',
		label: __( 'Display on all pages', 'notibar' ),
	},
	{
		value: 'none',
		label: __( 'Hide on all pages', 'notibar' ),
	},
	{
		value: 'include',
		label: __( 'Show only on selected pages', 'notibar' ),
	},
	{
		value: 'exclude',
		label: __( 'Hide only on selected pages', 'notibar' ),
	},
];

const POST_LOGIC_OPTIONS = [
	{
		value: 'all',
		label: __( 'Display on all posts', 'notibar' ),
	},
	{
		value: 'none',
		label: __( 'Hide on all posts', 'notibar' ),
	},
	{
		value: 'include',
		label: __( 'Show only on selected posts', 'notibar' ),
	},
	{
		value: 'exclude',
		label: __( 'Hide only on selected posts', 'notibar' ),
	},
];

const PICKER_LOGIC = [ 'include', 'exclude' ];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with updated bar.
 */
export function DisplayTab( { bar, onChange } ) {
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { display } = bar;

	function toggleDevice( device, checked ) {
		const next = checked
			? [ ...display.devices, device ]
			: display.devices.filter( ( d ) => d !== device );
		set( 'display.devices', next );
	}

	const showPagePicker = PICKER_LOGIC.includes( display.pageLogic );
	const showPostPicker = PICKER_LOGIC.includes( display.postLogic );

	return (
		<div className="njt-notibar-tab-content">
			{ /* Device targeting */ }
			<fieldset className="njt-notibar-fieldset">
				<legend className="njt-notibar-fieldset__legend">
					{ __( 'Show on devices', 'notibar' ) }
				</legend>
				<CheckboxControl
					label={ __( 'Desktop', 'notibar' ) }
					checked={ display.devices.includes( 'desktop' ) }
					onChange={ ( v ) => toggleDevice( 'desktop', v ) }
				/>
				<CheckboxControl
					label={ __( 'Mobile', 'notibar' ) }
					checked={ display.devices.includes( 'mobile' ) }
					onChange={ ( v ) => toggleDevice( 'mobile', v ) }
				/>
			</fieldset>

			{ /* Page logic */ }
			<RadioControl
				label={ __( 'Page logic', 'notibar' ) }
				selected={ display.pageLogic }
				options={ PAGE_LOGIC_OPTIONS }
				onChange={ ( v ) => set( 'display.pageLogic', v ) }
			/>

			{ showPagePicker && (
				<AsyncPostPicker
					postType="page"
					value={ display.pageIds }
					onChange={ ( ids ) => set( 'display.pageIds', ids ) }
				/>
			) }

			{ /* Post logic */ }
			<RadioControl
				label={ __( 'Post logic', 'notibar' ) }
				selected={ display.postLogic }
				options={ POST_LOGIC_OPTIONS }
				onChange={ ( v ) => set( 'display.postLogic', v ) }
			/>

			{ showPostPicker && (
				<AsyncPostPicker
					postType="post"
					value={ display.postIds }
					onChange={ ( ids ) => set( 'display.postIds', ids ) }
				/>
			) }

			<DisplayTabCptBlock bar={ bar } onChange={ onChange } />

			<DisplayTabAudienceBlock bar={ bar } onChange={ onChange } />
		</div>
	);
}
