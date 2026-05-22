/**
 * useRestSearch — generic debounced REST search hook.
 *
 * Returns { items, isLoading } for a paginated REST endpoint.
 * Stable references via useCallback to prevent re-render storms.
 */
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

/**
 * @param {Object} opts
 * @param {string} opts.type         Post type. Single slug ('page' | 'post' | CPT)
 *                                   or comma-separated list for multi-CPT search.
 * @param {string} opts.query        Search query string.
 * @param {number} [opts.debounceMs] Debounce delay in ms (default 300).
 * @return {Object} { items, isLoading } — items are { value, label, type } so
 *                                          callers can disambiguate cross-CPT.
 */
export function useRestSearch( { type, query, debounceMs = 300 } ) {
	const [ items, setItems ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const timerRef = useRef( null );
	const abortRef = useRef( null );

	const fetchItems = useCallback(
		( q ) => {
			// Abort any in-flight request.
			if ( abortRef.current ) {
				abortRef.current.abort();
			}

			const controller = new AbortController();
			abortRef.current = controller;
			setIsLoading( true );

			const path = `/notibar/v1/posts?type=${ encodeURIComponent(
				type
			) }&q=${ encodeURIComponent( q ) }`;

			apiFetch( { path, signal: controller.signal } )
				.then( ( data ) => {
					// REST returns { items, hasMore } — unwrap. Old code did
					// Array.isArray(data) which was always false, so search
					// never populated.
					const list =
						data && Array.isArray( data.items ) ? data.items : [];
					setItems(
						list.map( ( item ) => ( {
							value: item.id,
							label: item.title,
							type: item.type,
						} ) )
					);
					setIsLoading( false );
				} )
				.catch( ( err ) => {
					// Ignore abort errors — they're intentional.
					if ( err && err.name !== 'AbortError' ) {
						setIsLoading( false );
					}
				} );
		},
		[ type ]
	);

	useEffect( () => {
		// Clear previous debounce.
		if ( timerRef.current ) {
			clearTimeout( timerRef.current );
		}

		timerRef.current = setTimeout( () => {
			fetchItems( query );
		}, debounceMs );

		return () => {
			if ( timerRef.current ) {
				clearTimeout( timerRef.current );
			}
		};
	}, [ query, debounceMs, fetchItems ] );

	// Cancel any in-flight requests on unmount.
	useEffect( () => {
		return () => {
			if ( abortRef.current ) {
				abortRef.current.abort();
			}
		};
	}, [] );

	return { items, isLoading };
}

/**
 * Fetch items by IDs — used to hydrate chip labels on mount.
 *
 * @param {string} type Post type.
 * @param {Array}  ids  Array of IDs (may include 'home_page').
 * @return {Promise<Array>} Promise resolving to array of { value, label }.
 */
export async function fetchItemsByIds( type, ids ) {
	if ( ! ids || ids.length === 0 ) {
		return [];
	}
	const joined = ids.join( ',' );
	const path = `/notibar/v1/posts/by-ids?type=${ encodeURIComponent(
		type
	) }&ids=${ encodeURIComponent( joined ) }`;
	try {
		const data = await apiFetch( { path } );
		// REST returns { items: [...] } — unwrap.
		const list = data && Array.isArray( data.items ) ? data.items : [];
		return list.map( ( item ) => ( {
			value: item.id,
			label: item.title,
			type: item.type,
		} ) );
	} catch {
		// Swallow — return empty so UI still loads.
	}
	return [];
}
