/**
 * DisplayTabCptBlock — "Other post types" section of the Display tab.
 *
 * Owns 2 CPT-bucket fields: cptLogic (4-state radio) and cptTypes
 * (multi-select). Type-scoped: the rule governs single CPT pages by post
 * TYPE — there is no per-item picker. Extracted into its own file so
 * DisplayTab.jsx stays under the 200 LOC cap.
 *
 * Visibility rules:
 *   - cptLogic radio: always visible.
 *   - CptMultiSelect: only when cptLogic ∈ {include, exclude} (all/none
 *     apply to every CPT single and need no type selection).
 */
import { RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { CptMultiSelect } from '../fields/CptMultiSelect';

const CPT_LOGIC_OPTIONS = [
	{
		value: 'all',
		label: __( 'Show on all post types', 'notibar' ),
	},
	{
		value: 'none',
		label: __( 'Hide on all post types', 'notibar' ),
	},
	{
		value: 'include',
		label: __( 'Show on selected post types', 'notibar' ),
	},
	{
		value: 'exclude',
		label: __( 'Hide on selected post types', 'notibar' ),
	},
];

const TYPES_LOGIC = [ 'include', 'exclude' ];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with updated bar.
 */
export function DisplayTabCptBlock( { bar, onChange } ) {
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { display } = bar;
	const cptTypes = Array.isArray( display.cptTypes ) ? display.cptTypes : [];
	const cptLogic = display.cptLogic || 'none';
	const showTypes = TYPES_LOGIC.includes( cptLogic );

	return (
		<fieldset className="njt-notibar-fieldset njt-notibar-cpt-block">
			<legend className="njt-notibar-fieldset__legend">
				{ __( 'Other post types', 'notibar' ) }
			</legend>

			<div
				style={ { display: 'flex', flexDirection: 'column', gap: 12 } }
			>
				<RadioControl
					label={ __( 'CPT logic', 'notibar' ) }
					selected={ cptLogic }
					options={ CPT_LOGIC_OPTIONS }
					onChange={ ( v ) => set( 'display.cptLogic', v ) }
				/>

				{ showTypes && (
					<CptMultiSelect
						value={ cptTypes }
						onChange={ ( next ) => set( 'display.cptTypes', next ) }
					/>
				) }
			</div>
		</fieldset>
	);
}
