/**
 * AsyncUserPicker — multi-select user picker backed by REST search.
 *
 * Mirrors AsyncPostPicker but targets /notibar/v1/users (no synthetic tokens).
 * Chips hold numeric user IDs; labels hydrate from /users/by-ids on mount.
 */
import { useState, useEffect, useRef } from '@wordpress/element';
import { ComboboxControl } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

const DEBOUNCE_MS = 300;

/**
 * @param {Object}   props
 * @param {number[]} props.value    Selected user IDs.
 * @param {Function} props.onChange Called with the updated IDs array.
 */
export function AsyncUserPicker( { value = [], onChange } ) {
	const [ query, setQuery ] = useState( '' );
	const [ results, setResults ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ labels, setLabels ] = useState( {} );
	const timerRef = useRef( null );
	const abortRef = useRef( null );

	// Debounced search.
	useEffect( () => {
		if ( timerRef.current ) {
			clearTimeout( timerRef.current );
		}
		timerRef.current = setTimeout( () => {
			if ( abortRef.current ) {
				abortRef.current.abort();
			}
			const controller = new AbortController();
			abortRef.current = controller;
			setIsLoading( true );
			apiFetch( {
				path: `/notibar/v1/users?q=${ encodeURIComponent( query ) }`,
				signal: controller.signal,
			} )
				.then( ( data ) => {
					const list =
						data && Array.isArray( data.items ) ? data.items : [];
					setResults( list );
					setIsLoading( false );
				} )
				.catch( ( err ) => {
					if ( err && err.name !== 'AbortError' ) {
						setIsLoading( false );
					}
				} );
		}, DEBOUNCE_MS );
		return () => {
			if ( timerRef.current ) {
				clearTimeout( timerRef.current );
			}
		};
	}, [ query ] );

	// Hydrate labels for pre-existing IDs on mount / when value changes.
	useEffect( () => {
		const missing = value.filter( ( id ) => ! labels[ id ] );
		if ( missing.length === 0 ) {
			return;
		}
		apiFetch( {
			path: `/notibar/v1/users/by-ids?ids=${ encodeURIComponent(
				missing.join( ',' )
			) }`,
		} )
			.then( ( data ) => {
				const list =
					data && Array.isArray( data.items ) ? data.items : [];
				setLabels( ( prev ) => {
					const next = { ...prev };
					list.forEach( ( item ) => {
						next[ item.id ] = item.title;
					} );
					return next;
				} );
			} )
			.catch( () => {} );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ value.join( ',' ) ] );

	const options = results
		.filter( ( item ) => ! value.includes( item.id ) )
		.map( ( item ) => ( {
			value: String( item.id ),
			label: item.title,
		} ) );

	function handleSelect( selectedValue ) {
		if ( ! selectedValue ) {
			return;
		}
		const id = Number( selectedValue );
		if ( value.includes( id ) ) {
			return;
		}
		const found = results.find( ( i ) => String( i.id ) === selectedValue );
		if ( found ) {
			setLabels( ( prev ) => ( { ...prev, [ id ]: found.title } ) );
		}
		onChange( [ ...value, id ] );
		setQuery( '' );
	}

	function labelFor( id ) {
		return labels[ id ] || String( id );
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
								onClick={ () =>
									onChange(
										value.filter( ( v ) => v !== id )
									)
								}
							>
								&times;
							</button>
						</span>
					) ) }
				</div>
			) }

			<ComboboxControl
				label={ __( 'Search users…', 'notibar' ) }
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
