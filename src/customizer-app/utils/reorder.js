/**
 * Array reorder helper for dnd-kit drag-end events.
 * Returns a new array with the item moved from `fromIndex` to `toIndex`,
 * and rewrites the `order` field (0..n-1) on each element.
 *
 * @param {Array}  items
 * @param {number} fromIndex
 * @param {number} toIndex
 * @return {Array} Reordered array with updated order fields.
 */
export function reorderBars( items, fromIndex, toIndex ) {
	const result = [ ...items ];
	const [ moved ] = result.splice( fromIndex, 1 );
	result.splice( toIndex, 0, moved );
	return result.map( ( item, index ) => ( { ...item, order: index } ) );
}
