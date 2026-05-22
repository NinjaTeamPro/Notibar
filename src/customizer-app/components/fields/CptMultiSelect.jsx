/**
 * CptMultiSelect — chips + dropdown picker for CPT slugs.
 *
 * Backs the `cptTypes` field on a bar's display block. Fetches the public
 * CPT list (page/post/attachment excluded) from GET /notibar/v1/cpts once
 * per SPA session via a module-level Promise cache.
 *
 * Removing a CPT does NOT touch `cptIds` — orphaned IDs persist in storage
 * so re-adding the CPT restores prior selections (decision #6).
 */
import { useEffect, useState, useMemo } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

// Module-level cache: single fetch per SPA session. Refresh requires reload —
// acceptable since CPT registration is a server-side admin action.
let cptListPromise = null;

function getCptList() {
	if ( ! cptListPromise ) {
		cptListPromise = apiFetch( { path: '/notibar/v1/cpts' } )
			.then( ( data ) =>
				data && Array.isArray( data.items ) ? data.items : []
			)
			.catch( ( err ) => {
				// eslint-disable-next-line no-console
				console.warn( 'Notibar: /cpts fetch failed', err );
				return [];
			} );
	}
	return cptListPromise;
}

/**
 * @param {Object}   props
 * @param {string[]} props.value    Selected CPT slugs.
 * @param {Function} props.onChange Called with updated slug array.
 */
export function CptMultiSelect( { value = [], onChange } ) {
	const [ cptList, setCptList ] = useState( [] );

	useEffect( () => {
		let cancelled = false;
		getCptList().then( ( items ) => {
			if ( ! cancelled ) {
				setCptList( items );
			}
		} );
		return () => {
			cancelled = true;
		};
	}, [] );

	const labelFor = ( slug ) => {
		const found = cptList.find( ( c ) => c.slug === slug );
		return found ? found.label : slug;
	};

	const options = useMemo( () => {
		return cptList
			.filter( ( c ) => ! value.includes( c.slug ) )
			.map( ( c ) => ( { value: c.slug, label: c.label } ) );
	}, [ cptList, value ] );

	const handleSelect = ( slug ) => {
		if ( ! slug || value.includes( slug ) ) {
			return;
		}
		onChange( [ ...value, slug ] );
	};

	const handleRemove = ( slug ) => {
		onChange( value.filter( ( s ) => s !== slug ) );
	};

	return (
		<div className="njt-notibar-post-picker">
			{ value.length > 0 && (
				<div className="njt-notibar-post-picker__chips">
					{ value.map( ( slug ) => (
						<span
							key={ slug }
							className="njt-notibar-post-picker__chip"
						>
							{ labelFor( slug ) }
							<button
								type="button"
								className="njt-notibar-post-picker__chip-remove"
								aria-label={ `${ __(
									'Remove',
									'notibar'
								) } ${ labelFor( slug ) }` }
								onClick={ () => handleRemove( slug ) }
							>
								&times;
							</button>
						</span>
					) ) }
				</div>
			) }

			<ComboboxControl
				label={ __( 'Select post types…', 'notibar' ) }
				value={ '' }
				options={ options }
				onChange={ handleSelect }
				allowReset={ false }
				hideLabelFromVision={ value.length > 0 }
			/>
		</div>
	);
}
