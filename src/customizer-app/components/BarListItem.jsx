/**
 * BarListItem — a single sortable row in the bar list.
 *
 * Layout (single horizontal row in narrow Customizer panel):
 *   [≡ drag]  [name button (click = select/edit)]  [enabled toggle]  [⋯ menu]
 *
 * Duplicate + Delete are housed in an overflow menu (DropdownMenu) so the
 * row stays compact at ~280-580px panel widths. "Edit" is folded into the
 * clickable name — clicking the name selects the bar for editing.
 */
import { __ } from '@wordpress/i18n';
import {
	ToggleControl,
	DropdownMenu,
	MenuItem,
	MenuGroup,
} from '@wordpress/components';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Inline SVG keeps us off the @wordpress/icons dependency; matches the
// 24×24 viewBox that wp-components Buttons render icons at by default.
const moreVerticalIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
	>
		<circle cx="12" cy="5" r="1.6" />
		<circle cx="12" cy="12" r="1.6" />
		<circle cx="12" cy="19" r="1.6" />
	</svg>
);

/**
 * @param {Object}   props
 * @param {Object}   props.bar         Bar object.
 * @param {boolean}  props.isSelected  Whether this bar is currently selected.
 * @param {Function} props.onSelect    Called when row is clicked (select for edit).
 * @param {Function} props.onToggle    Called with new enabled boolean.
 * @param {Function} props.onDuplicate Called to duplicate this bar.
 * @param {Function} props.onDelete    Called to delete this bar.
 */
export function BarListItem( {
	bar,
	isSelected,
	onSelect,
	onToggle,
	onDuplicate,
	onDelete,
} ) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable( { id: bar.id } );

	const style = {
		transform: CSS.Transform.toString( transform ),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const displayName = bar.name || __( 'Untitled bar', 'notibar' );

	const handleDelete = () => {
		// translators: %s is the bar name.
		const msg = __(
			'Delete bar "%s"? This cannot be undone.',
			'notibar'
		).replace( '%s', displayName );
		// eslint-disable-next-line no-alert
		if ( window.confirm( msg ) ) {
			onDelete();
		}
	};

	return (
		<div
			ref={ setNodeRef }
			style={ style }
			className={
				'njt-notibar-bar-item' +
				( isSelected ? ' njt-notibar-bar-item--selected' : '' )
			}
		>
			<span
				className="njt-notibar-bar-item__handle"
				{ ...attributes }
				{ ...listeners }
				aria-label={ __( 'Drag to reorder', 'notibar' ) }
				title={ __( 'Drag to reorder', 'notibar' ) }
			>
				&#9776;
			</span>

			<button
				type="button"
				className="njt-notibar-bar-item__name"
				onClick={ onSelect }
				aria-pressed={ isSelected }
				title={ __( 'Click to edit', 'notibar' ) }
			>
				{ displayName }
			</button>

			<ToggleControl
				label=""
				hideLabelFromVision
				checked={ bar.enabled ?? true }
				onChange={ onToggle }
				className="njt-notibar-bar-item__toggle"
			/>

			<DropdownMenu
				icon={ moreVerticalIcon }
				label={ __( 'Bar actions', 'notibar' ) }
				className="njt-notibar-bar-item__menu"
				popoverProps={ { placement: 'bottom-end' } }
			>
				{ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							onClick={ () => {
								onSelect();
								onClose();
							} }
						>
							{ __( 'Edit', 'notibar' ) }
						</MenuItem>
						<MenuItem
							onClick={ () => {
								onDuplicate();
								onClose();
							} }
						>
							{ __( 'Duplicate', 'notibar' ) }
						</MenuItem>
						<MenuItem
							isDestructive
							onClick={ () => {
								onClose();
								handleDelete();
							} }
						>
							{ __( 'Delete', 'notibar' ) }
						</MenuItem>
					</MenuGroup>
				) }
			</DropdownMenu>
		</div>
	);
}
