/**
 * CountryMultiSelect — chips + searchable dropdown picker for ISO country codes.
 *
 * Backs the `countries` field on a bar's display block. Options come from the
 * bundled ISO 3166-1 alpha-2 list (no API call). Mirrors CptMultiSelect's
 * chips + ComboboxControl pattern and reuses its `njt-notibar-post-picker`
 * styling, so no new CSS is needed.
 *
 * Value is an array of uppercase ISO-2 codes; chips display the country name.
 */
import { useMemo } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { COUNTRIES } from '../../../shared/countries';

/**
 * @param {Object}   props
 * @param {string[]} props.value    Selected ISO-2 country codes.
 * @param {Function} props.onChange Called with the updated code array.
 */
export function CountryMultiSelect( { value = [], onChange } ) {
	const labelFor = ( code ) => {
		const found = COUNTRIES.find( ( c ) => c.code === code );
		return found ? found.name : code;
	};

	const options = useMemo(
		() =>
			COUNTRIES.filter( ( c ) => ! value.includes( c.code ) ).map(
				( c ) => ( { value: c.code, label: c.name } )
			),
		[ value ]
	);

	const handleSelect = ( code ) => {
		if ( ! code || value.includes( code ) ) {
			return;
		}
		onChange( [ ...value, code ] );
	};

	const handleRemove = ( code ) => {
		onChange( value.filter( ( c ) => c !== code ) );
	};

	return (
		<div className="njt-notibar-post-picker">
			{ value.length > 0 && (
				<div className="njt-notibar-post-picker__chips">
					{ value.map( ( code ) => (
						<span
							key={ code }
							className="njt-notibar-post-picker__chip"
						>
							{ labelFor( code ) }
							<button
								type="button"
								className="njt-notibar-post-picker__chip-remove"
								aria-label={ `${ __(
									'Remove',
									'notibar'
								) } ${ labelFor( code ) }` }
								onClick={ () => handleRemove( code ) }
							>
								&times;
							</button>
						</span>
					) ) }
				</div>
			) }

			<ComboboxControl
				label={ __( 'Select countries…', 'notibar' ) }
				value={ '' }
				options={ options }
				onChange={ handleSelect }
				allowReset={ false }
				hideLabelFromVision={ value.length > 0 }
			/>
		</div>
	);
}
