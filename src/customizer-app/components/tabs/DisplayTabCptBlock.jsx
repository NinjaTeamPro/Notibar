/**
 * DisplayTabCptBlock — "Other post types" section of the Display tab.
 *
 * Owns the 3 CPT-bucket fields: cptTypes (multi-select), cptLogic (4-state
 * radio), cptIds (merged multi-CPT picker). Extracted into its own file so
 * DisplayTab.jsx stays under the 200 LOC cap.
 *
 * Visibility rules:
 *   - CptMultiSelect: always visible.
 *   - cptLogic radio: only when cptTypes.length > 0.
 *   - Picker: only when cptTypes.length > 0 AND cptLogic ∈ {include, exclude}.
 *   - Product-precedence hint: only when 'product' is in cptTypes.
 */
import { RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { CptMultiSelect } from '../fields/CptMultiSelect';
import { AsyncPostPicker } from '../fields/AsyncPostPicker';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const CPT_LOGIC_OPTIONS = [
	{
		value: 'all',
		label: __( 'Display on all selected CPT instances', 'notibar' ),
	},
	{
		value: 'none',
		label: __( 'Hide on all selected CPT instances', 'notibar' ),
	},
	{
		value: 'include',
		label: __( 'Show only on selected items', 'notibar' ),
	},
	{
		value: 'exclude',
		label: __( 'Hide only on selected items', 'notibar' ),
	},
];

const PICKER_LOGIC = [ 'include', 'exclude' ];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with updated bar.
 */
export function DisplayTabCptBlock( { bar, onChange } ) {
	const pro = isProEdition();
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { display } = bar;
	const cptTypes = Array.isArray( display.cptTypes ) ? display.cptTypes : [];
	const cptLogic = display.cptLogic || 'all';
	const cptIds = Array.isArray( display.cptIds ) ? display.cptIds : [];
	const hasTypes = cptTypes.length > 0;
	const showPicker = hasTypes && PICKER_LOGIC.includes( cptLogic );
	const hasProduct = hasTypes && cptTypes.includes( 'product' );

	return (
		<fieldset className="njt-notibar-fieldset njt-notibar-cpt-block">
			<legend className="njt-notibar-fieldset__legend">
				{ __( 'Other post types', 'notibar' ) }
			</legend>

			{ ! pro && (
				<ProUpgradeNotice
					feature={ __(
						'Targeting by custom post type (incl. WooCommerce products)',
						'notibar'
					) }
				/>
			) }

			<div className={ pro ? undefined : 'njt-pro-locked' }>
				<CptMultiSelect
					value={ cptTypes }
					onChange={ ( next ) => set( 'display.cptTypes', next ) }
				/>

				{ hasTypes && (
					<RadioControl
						label={ __( 'CPT logic', 'notibar' ) }
						selected={ cptLogic }
						options={ CPT_LOGIC_OPTIONS }
						onChange={ ( v ) => set( 'display.cptLogic', v ) }
					/>
				) }

				{ showPicker && (
					<AsyncPostPicker
						postType={ cptTypes }
						value={ cptIds }
						onChange={ ( ids ) => set( 'display.cptIds', ids ) }
					/>
				) }

				{ hasProduct && (
					<p className="njt-notibar-help">
						{ __(
							'Note: when Product is selected here, this rule overrides the page-logic "Single Product page" token for single product pages.',
							'notibar'
						) }
					</p>
				) }
			</div>
		</fieldset>
	);
}
