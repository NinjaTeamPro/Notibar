/**
 * Custom hooks for reading/writing Customizer settings as React state.
 *
 * Re-entrancy guard pattern (isLocalWrite ref) prevents infinite loops:
 *   local change → writeBars() → wp.customize.set() → bind fires →
 *   isLocalWrite ref = true → handler bails → no setState → no loop.
 */
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import {
	readBars,
	readGlobal,
	writeBars,
	writeGlobal,
	subscribe,
} from './customizer-bridge';

// ------------------------------------------------------------------
// useBars
// ------------------------------------------------------------------

/**
 * Hook: bars array state + Customizer sync.
 *
 * @return {[Array, Function]} [bars, setBars]
 */
export function useBars() {
	const [ bars, setBars ] = useState( () => readBars() );
	const isLocalWrite = useRef( false );

	useEffect( () => {
		const unsubscribe = subscribe( 'njt_nofi_bars', ( next ) => {
			// Skip if this change was triggered by our own write.
			if ( isLocalWrite.current ) {
				isLocalWrite.current = false;
				return;
			}
			if ( ! Array.isArray( next ) ) {
				return;
			}
			// Only update if value actually differs (avoids redundant renders).
			setBars( ( prev ) => {
				const prevStr = JSON.stringify( prev );
				const nextStr = JSON.stringify( next );
				return prevStr !== nextStr ? next : prev;
			} );
		} );

		return unsubscribe;
	}, [] );

	// Support both `update(newArray)` and `update((prev) => newArray)` forms.
	// The functional form is needed in App.jsx to avoid stale-closure renders.
	// We resolve inside React's setBars updater so we have the previous value
	// to apply, then forward the resolved array to writeBars (debounced — safe
	// against React 18 strict-mode double invocation).
	const update = useCallback( ( next ) => {
		setBars( ( prev ) => {
			const resolved = typeof next === 'function' ? next( prev ) : next;
			isLocalWrite.current = true;
			writeBars( resolved );
			return resolved;
		} );
	}, [] );

	return [ bars, update ];
}

// ------------------------------------------------------------------
// useGlobal
// ------------------------------------------------------------------

/**
 * Hook: global config state + Customizer sync.
 *
 * @return {[Object, Function]} [global, setGlobal]
 */
export function useGlobal() {
	const [ global, setGlobal ] = useState( () => readGlobal() );
	const isLocalWrite = useRef( false );

	useEffect( () => {
		const unsubscribe = subscribe( 'njt_nofi_global', ( next ) => {
			if ( isLocalWrite.current ) {
				isLocalWrite.current = false;
				return;
			}
			if ( ! next || typeof next !== 'object' || Array.isArray( next ) ) {
				return;
			}
			setGlobal( ( prev ) => {
				const prevStr = JSON.stringify( prev );
				const nextStr = JSON.stringify( next );
				return prevStr !== nextStr ? next : prev;
			} );
		} );

		return unsubscribe;
	}, [] );

	// Same dual-form support as useBars (see comment there).
	const update = useCallback( ( next ) => {
		setGlobal( ( prev ) => {
			const resolved = typeof next === 'function' ? next( prev ) : next;
			isLocalWrite.current = true;
			writeGlobal( resolved );
			return resolved;
		} );
	}, [] );

	return [ global, update ];
}
