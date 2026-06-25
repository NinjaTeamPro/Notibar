/**
 * ColorFieldWithReset — wraps ColorPicker with a "Reset to default" button.
 *
 * Renders a collapsible colour picker with a circular swatch and a Reset button.
 * Click the swatch to open/close the picker. Click Reset to restore defaultValue.
 */
import { useState } from '@wordpress/element';
import { ColorPicker, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * @param {Object}   props
 * @param {string}   props.label         Field label shown above the picker.
 * @param {string}   props.value         Current hex colour value.
 * @param {Function} props.onChange      Called with new hex string.
 * @param {string}   props.defaultValue  Value to reset to when Reset clicked.
 * @param {boolean}  [props.enableAlpha] When true, the picker exposes an alpha
 *                                       slider and emits 8-digit hex (#rrggbbaa)
 *                                       for transparent colours. Default false.
 */
export function ColorFieldWithReset( {
	label,
	value,
	onChange,
	defaultValue,
	enableAlpha = false,
} ) {
	const [ isOpen, setIsOpen ] = useState( false );

	function handleReset() {
		onChange( defaultValue );
	}

	return (
		<div className="njt-notibar-color-field">
			<div className="njt-notibar-color-field__header">
				<span className="njt-notibar-color-field__label">
					{ label }
				</span>
				<div className="njt-notibar-color-field__actions">
					<button
						type="button"
						className="njt-notibar-color-field__swatch"
						style={ { background: value } }
						aria-label={ `${ label }: ${ value }` }
						onClick={ () => setIsOpen( ( o ) => ! o ) }
					/>
					<Button
						variant="tertiary"
						size="small"
						isSmall
						onClick={ handleReset }
						disabled={ value === defaultValue }
					>
						{ __( 'Reset', 'notibar' ) }
					</Button>
				</div>
			</div>

			{ isOpen && (
				<div className="njt-notibar-color-field__picker">
					<ColorPicker
						color={ value }
						onChange={ onChange }
						enableAlpha={ enableAlpha }
					/>
				</div>
			) }
		</div>
	);
}
