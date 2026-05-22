/**
 * AsyncPostPicker — multi-select post/page/CPT picker backed by REST search.
 *
 * Uses ComboboxControl for single-pick + maintains a chips array internally.
 * Supports synthetic tokens (home_page, wc_single_product, tpl:*) for the
 * 'page' single-type context only.
 *
 * postType accepts:
 *   - string ('page' | 'post' | CPT slug) — legacy single-CPT mode.
 *   - string[] (multi-CPT) — merged search across the listed CPTs. Chip
 *     labels become "title (type)" so admin can disambiguate items from
 *     different CPTs.
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
 * @param {Object}          props
 * @param {string|string[]} props.postType Single CPT slug or list of slugs.
 * @param {Array}           props.value    Selected IDs (int or synthetic).
 * @param {Function}        props.onChange Called with updated IDs array.
 */
export function AsyncPostPicker( { postType, value = [], onChange } ) {
	const [ query, setQuery ] = useState( '' );
	const [ selectedLabels, setSelectedLabels ] = useState( {} );

	// Normalize postType into a stable comma-separated key. Sorting keeps the
	// key stable across array reorderings so REST cache + useEffect deps
	// don't churn when the source array reorders without changing membership.
	const isMulti = Array.isArray( postType ) && postType.length > 1;
	const postTypeKey = useMemo( () => {
		if ( Array.isArray( postType ) ) {
			return [ ...postType ].sort().join( ',' );
		}
		return postType;
	}, [ postType ] );

	// Clear cached labels when the bound CPT set changes — old labels may
	// reference items from a different CPT context and would otherwise drift.
	// Empty cache forces a fresh hydrate against the new postTypeKey.
	useEffect( () => {
		setSelectedLabels( {} );
	}, [ postTypeKey ] );

	// Hydrate labels for any pre-existing IDs on mount.
	// IMPORTANT: synthetic-token filter is load-bearing — the REST
	// /posts/by-ids endpoint only accepts numeric IDs. Tokens get their
	// labels from constants below or the cached selectedLabels map.
	// Deps use '|' delimiter (not ',') so future synthetic tokens that may
	// contain commas can't collide into a single cache key.
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

		fetchItemsByIds( postTypeKey, idsToFetch ).then( ( items ) => {
			setSelectedLabels( ( prev ) => {
				const next = { ...prev };
				items.forEach( ( item ) => {
					next[ item.value ] = {
						title: item.label,
						type: item.type || '',
					};
				} );
				return next;
			} );
		} );
		// Only run when value array composition or CPT context changes.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ postTypeKey, value.join( '|' ) ] );

	const { items: searchItems, isLoading } = useRestSearch( {
		type: postTypeKey,
		query,
		debounceMs: 300,
	} );

	const options = useMemo( () => {
		// Server-side handle_search prepends home_page synthetic when
		// appropriate; client must not double-prepend.
		return searchItems
			.filter( ( item ) => ! value.includes( item.value ) )
			.map( ( item ) => ( {
				value: String( item.value ),
				label:
					isMulti && item.type
						? `${ item.label } (${ item.type })`
						: item.label,
			} ) );
	}, [ searchItems, value, isMulti ] );

	function handleSelect( selectedValue ) {
		if ( ! selectedValue ) {
			return;
		}
		// Synthetic string tokens stay as strings; everything else becomes
		// a numeric WP post ID. Templates use a "tpl:" prefix and must
		// also be preserved as strings.
		const isSyntheticToken =
			selectedValue === 'home_page' ||
			selectedValue === 'wc_single_product' ||
			selectedValue.startsWith( 'tpl:' );
		const id = isSyntheticToken ? selectedValue : Number( selectedValue );
		if ( value.includes( id ) ) {
			return;
		}

		let entry = null;
		if ( selectedValue === 'home_page' ) {
			entry = { title: HOME_PAGE_OPTION.label, type: 'page' };
		} else if ( selectedValue === 'wc_single_product' ) {
			entry = { title: SINGLE_PRODUCT_OPTION.label, type: 'page' };
		} else {
			const found = searchItems.find(
				( i ) => String( i.value ) === selectedValue
			);
			if ( found ) {
				entry = { title: found.label, type: found.type || '' };
			}
		}
		if ( entry ) {
			setSelectedLabels( ( prev ) => ( { ...prev, [ id ]: entry } ) );
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
		const cached = selectedLabels[ id ];
		if ( ! cached ) {
			return String( id );
		}
		return isMulti && cached.type
			? `${ cached.title } (${ cached.type })`
			: cached.title;
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
