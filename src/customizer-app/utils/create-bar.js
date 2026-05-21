/**
 * Shared helper for "add bar" actions.
 * Computes the next order value and produces a fresh bar from defaults.
 */
import { newBar } from './defaults';

/**
 * Build a new bar appended to the end of the existing list.
 *
 * @param {Array} bars Current bars array.
 * @return {Object} Fresh bar object with order = max(existing) + 1.
 */
export function createNextBar( bars ) {
	const maxOrder = bars.reduce( ( m, b ) => Math.max( m, b.order ?? 0 ), -1 );
	return newBar( { order: maxOrder + 1 } );
}
