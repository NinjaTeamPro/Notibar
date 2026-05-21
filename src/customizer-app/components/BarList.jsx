/**
 * BarList — drag-to-reorder list of bars using @dnd-kit/sortable.
 *
 * Each bar is rendered as a BarListItem (drag handle, name, toggle, actions).
 * The "Add bar" button appends a new bar using the server-emitted default
 * from window.njtNotibarBoot.defaultBar via newBar() factory.
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BarListItem } from './BarListItem';
import { reorderBars } from '../utils/reorder';
import { createNextBar } from '../utils/create-bar';
import { uuidv4 } from '../utils/uuid';

/**
 * @param {Object}   props
 * @param {Array}    props.bars       Array of bar objects.
 * @param {string}   props.selectedId ID of the currently selected bar.
 * @param {Function} props.onSelect   Called with bar id to select.
 * @param {Function} props.onChange   Called with updated bars array.
 */
export function BarList( { bars, selectedId, onSelect, onChange } ) {
	const sensors = useSensors(
		useSensor( PointerSensor ),
		useSensor( KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		} )
	);

	const handleDragEnd = ( event ) => {
		const { active, over } = event;
		if ( ! over || active.id === over.id ) {
			return;
		}
		const fromIndex = bars.findIndex( ( b ) => b.id === active.id );
		const toIndex = bars.findIndex( ( b ) => b.id === over.id );
		if ( fromIndex === -1 || toIndex === -1 ) {
			return;
		}
		onChange( reorderBars( bars, fromIndex, toIndex ) );
	};

	const handleAdd = () => {
		const bar = createNextBar( bars );
		onChange( [ ...bars, bar ] );
		onSelect( bar.id );
	};

	const handleToggle = ( barId, enabled ) => {
		onChange(
			bars.map( ( b ) => ( b.id === barId ? { ...b, enabled } : b ) )
		);
	};

	const handleDuplicate = ( barId ) => {
		const original = bars.find( ( b ) => b.id === barId );
		if ( ! original ) {
			return;
		}
		const maxOrder = bars.reduce(
			( m, b ) => Math.max( m, b.order ?? 0 ),
			-1
		);
		const copy = {
			...JSON.parse( JSON.stringify( original ) ),
			id: uuidv4(),
			name: `${ original.name || __( 'Untitled bar', 'notibar' ) } (${ __(
				'copy',
				'notibar'
			) })`,
			order: maxOrder + 1,
		};
		onChange( [ ...bars, copy ] );
		onSelect( copy.id );
	};

	const handleDelete = ( barId ) => {
		const next = bars
			.filter( ( b ) => b.id !== barId )
			.map( ( b, i ) => ( { ...b, order: i } ) );
		onChange( next );
	};

	return (
		<div className="njt-notibar-bar-list">
			{ bars.length === 0 && (
				<p className="njt-notibar-bar-list__empty">
					{ __( 'No bars yet — add one to get started.', 'notibar' ) }
				</p>
			) }

			<DndContext
				sensors={ sensors }
				collisionDetection={ closestCenter }
				onDragEnd={ handleDragEnd }
			>
				<SortableContext
					items={ bars.map( ( b ) => b.id ) }
					strategy={ verticalListSortingStrategy }
				>
					{ bars.map( ( bar ) => (
						<BarListItem
							key={ bar.id }
							bar={ bar }
							isSelected={ bar.id === selectedId }
							onSelect={ () => onSelect( bar.id ) }
							onToggle={ ( enabled ) =>
								handleToggle( bar.id, enabled )
							}
							onDuplicate={ () => handleDuplicate( bar.id ) }
							onDelete={ () => handleDelete( bar.id ) }
						/>
					) ) }
				</SortableContext>
			</DndContext>

			<div className="njt-notibar-bar-list__footer">
				<Button
					variant="primary"
					onClick={ handleAdd }
					className="njt-notibar-bar-list__add"
				>
					{ __( '+ Add bar', 'notibar' ) }
				</Button>
			</div>
		</div>
	);
}
