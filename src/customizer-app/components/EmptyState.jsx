/**
 * EmptyState — shown in the editor pane when no bars exist or none is selected.
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * @param {Object}   props
 * @param {Function} props.onAdd Called when the user clicks "Add your first bar".
 */
export function EmptyState( { onAdd } ) {
	return (
		<div className="njt-notibar-empty-state">
			<p className="njt-notibar-empty-state__message">
				{ __(
					'No notification bar selected. Add your first bar to get started.',
					'notibar'
				) }
			</p>
			<Button variant="primary" onClick={ onAdd }>
				{ __( 'Add your first bar', 'notibar' ) }
			</Button>
		</div>
	);
}
