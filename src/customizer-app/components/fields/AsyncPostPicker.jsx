/**
 * AsyncPostPicker — multi-select post/page picker backed by REST search.
 *
 * Uses ComboboxControl for single-pick + maintains a chips array internally.
 * Supports the 'home_page' pseudo-id for page type.
 */
import { useState, useEffect, useMemo } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useRestSearch, fetchItemsByIds } from '../../hooks/use-rest-search';

const HOME_PAGE_OPTION = {
	value: 'home_page',
	label: __( 'Front Page', 'notibar' ),
};

// "Single Product page" synthetic — same pattern as HOME_PAGE_OPTION. The
// label is hardcoded client-side so the chip renders instantly without a
// REST round-trip; the server's handle_by_ids endpoint also recognises
// the token in case the chip is hydrated from saved data on first mount.
const SINGLE_PRODUCT_OPTION = {
	value: 'wc_single_product',
	label: __( 'Single Product page', 'notibar' ),
};

/**
 * @param {Object}   props
 * @param {string}   props.postType 'page' | 'post'
 * @param {Array}    props.value    Array of selected IDs (int or 'home_page').
 * @param {Function} props.onChange Called with updated IDs array.
 */
export function AsyncPostPicker( { postType, value = [], onChange } ) {
	const [ query, setQuery ] = useState( '' );
	const [ selectedLabels, setSelectedLabels ] = useState( {} );

	// Hydrate labels for any pre-existing IDs on mount.
	// IMPORTANT: the `id !== 'home_page'` filter is load-bearing — the REST
	// /posts/by-ids endpoint only accepts numeric IDs. The home_page token
	// gets its label from the static HOME_PAGE_OPTION constant below. If
	// this filter is ever removed, the REST request will drop home_page
	// silently (ctype_digit check on the server), but the SPA may also
	// briefly show a broken chip — keep it.
	useEffect( () => {
		const idsToFetch = value.filter(
			( id ) =>
				id !== 'home_page' &&
				id !== 'wc_single_product' &&
				! selectedLabels[ id ]
		);
		if ( idsToFetch.length === 0 ) {
			return;
		}

		fetchItemsByIds( postType, idsToFetch ).then( ( items ) => {
			setSelectedLabels( ( prev ) => {
				const next = { ...prev };
				items.forEach( ( item ) => {
					next[ item.value ] = item.label;
				} );
				return next;
			} );
		} );
		// Only run when value array composition changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ postType, value.join( ',' ) ] );

	const { items: searchItems, isLoading } = useRestSearch( {
		type: postType,
		query,
		debounceMs: 300,
	} );

	const options = useMemo( () => {
		// Server-side RestPostsController::handle_search prepends the
		// home_page synthetic item when appropriate (i.e. when no static
		// front page is configured). Letting the client also prepend it
		// caused two "Front Page" rows in the dropdown. Server is the
		// single source of truth; HOME_PAGE_OPTION below is kept only for
		// instant chip labelling after select / before by-ids hydration.
		return searchItems
			.filter( ( item ) => ! value.includes( item.value ) )
			.map( ( item ) => ( {
				value: String( item.value ),
				label: item.label,
			} ) );
	}, [ searchItems, value ] );

	function handleSelect( selectedValue ) {
		if ( ! selectedValue ) {
			return;
		}
		// Synthetic string tokens stay as strings; everything else becomes
		// a numeric WP post/page ID. Templates use a "tpl:" prefix and must
		// also be preserved as strings.
		const isSyntheticToken =
			selectedValue === 'home_page' ||
			selectedValue === 'wc_single_product' ||
			selectedValue.startsWith( 'tpl:' );
		const id = isSyntheticToken ? selectedValue : Number( selectedValue );
		if ( value.includes( id ) ) {
			return;
		}

		// Cache label for the newly selected item.
		let found = null;
		if ( selectedValue === 'home_page' ) {
			found = HOME_PAGE_OPTION;
		} else if ( selectedValue === 'wc_single_product' ) {
			found = SINGLE_PRODUCT_OPTION;
		} else {
			found = searchItems.find(
				( i ) => String( i.value ) === selectedValue
			);
		}
		if ( found ) {
			setSelectedLabels( ( prev ) => ( {
				...prev,
				[ id ]: found.label,
			} ) );
		}

		onChange( [ ...value, id ] );
		setQuery( '' );
	}

	function handleRemove( id ) {
		onChange( value.filter( ( v ) => v !== id ) );
	}

	function labelFor( id ) {
		if ( id === 'home_page' ) {
			return HOME_PAGE_OPTION.label;
		}
		if ( id === 'wc_single_product' ) {
			return SINGLE_PRODUCT_OPTION.label;
		}
		return selectedLabels[ id ] || String( id );
	}

	return (
		<div className="njt-notibar-post-picker">
			{ value.length > 0 && (
				<div className="njt-notibar-post-picker__chips">
					{ value.map( ( id ) => (
						<span
							key={ id }
							className="njt-notibar-post-picker__chip"
						>
							{ labelFor( id ) }
							<button
								type="button"
								className="njt-notibar-post-picker__chip-remove"
								aria-label={ `${ __(
									'Remove',
									'notibar'
								) } ${ labelFor( id ) }` }
								onClick={ () => handleRemove( id ) }
							>
								&times;
							</button>
						</span>
					) ) }
				</div>
			) }

			<ComboboxControl
				label={ __( 'Search and add…', 'notibar' ) }
				value={ '' }
				options={ options }
				onFilterValueChange={ setQuery }
				onChange={ handleSelect }
				isLoading={ isLoading }
				allowReset={ false }
				hideLabelFromVision={ value.length > 0 }
			/>
		</div>
	);
}
