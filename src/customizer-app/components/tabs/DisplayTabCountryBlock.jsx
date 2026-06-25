/**
 * DisplayTabCountryBlock — "Country" section of the Display tab.
 *
 * Pro feature (locked + badged in Lite). Per-bar conditional display by visitor
 * country via display.countryLogic:
 *   - all     → no country restriction
 *   - include → show only in the selected countries
 *   - exclude → hide in the selected countries
 *
 * display.countries holds the ISO 3166-1 alpha-2 selection for the
 * include/exclude modes. Kept separate from the Audience section by design.
 */
import { RadioControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { CountryMultiSelect } from '../fields/CountryMultiSelect';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const COUNTRY_LOGIC_OPTIONS = [
	{ value: 'all', label: __( 'All countries', 'notibar' ) },
	{
		value: 'include',
		label: __( 'Show only in selected countries', 'notibar' ),
	},
	{ value: 'exclude', label: __( 'Hide in selected countries', 'notibar' ) },
];

const PICKER_LOGIC = [ 'include', 'exclude' ];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with the updated bar.
 */
export function DisplayTabCountryBlock( { bar, onChange } ) {
	const pro = isProEdition();
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { display } = bar;
	const logic = display.countryLogic || 'all';
	const countries = Array.isArray( display.countries )
		? display.countries
		: [];

	return (
		<fieldset className="njt-notibar-fieldset njt-notibar-country-block">
			<legend className="njt-notibar-fieldset__legend">
				{ __( 'Country', 'notibar' ) }
			</legend>

			{ ! pro && (
				<ProUpgradeNotice
					feature={ __(
						'Conditional display by country',
						'notibar'
					) }
				/>
			) }

			<div className={ pro ? undefined : 'njt-pro-locked' }>
				<RadioControl
					label={ __( 'Show this bar in', 'notibar' ) }
					selected={ logic }
					options={ COUNTRY_LOGIC_OPTIONS }
					onChange={ ( v ) => set( 'display.countryLogic', v ) }
				/>

				{ PICKER_LOGIC.includes( logic ) && (
					<CountryMultiSelect
						value={ countries }
						onChange={ ( ids ) => set( 'display.countries', ids ) }
					/>
				) }
			</div>
		</fieldset>
	);
}
