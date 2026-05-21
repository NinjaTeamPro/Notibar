/**
 * GlobalSettingsPane — display mode + rotation controls.
 *
 * The rotation interval and pause-on-hover controls are HIDDEN (not disabled)
 * when displayMode === 'single'. Reasoning: the WP Customizer panel is
 * narrow; greyed-out controls take vertical space and confuse users.
 */
import { __ } from '@wordpress/i18n';
import {
	RadioControl,
	RangeControl,
	ToggleControl,
} from '@wordpress/components';

const DISPLAY_MODE_OPTIONS = [
	{ label: __( 'Single bar', 'notibar' ), value: 'single' },
	{ label: __( 'Rotation', 'notibar' ), value: 'rotation' },
];

const ROTATION_ORDER_OPTIONS = [
	{ label: __( 'Sequential (list order)', 'notibar' ), value: 'sequential' },
	{ label: __( 'Random', 'notibar' ), value: 'random' },
];

/**
 * @param {Object}   props
 * @param {Object}   props.value    Global config object.
 * @param {Function} props.onChange Called with updated global config object.
 */
export function GlobalSettingsPane( { value, onChange } ) {
	const isRotation = value.displayMode === 'rotation';
	const set = ( key, val ) => onChange( { ...value, [ key ]: val } );

	return (
		<div className="njt-notibar-global-settings">
			<RadioControl
				label={ __( 'Display mode', 'notibar' ) }
				help={
					isRotation
						? __(
								'Bars rotate one at a time on a timer.',
								'notibar'
						  )
						: __(
								'Show one bar at a time, picked by order.',
								'notibar'
						  )
				}
				selected={ value.displayMode ?? 'single' }
				options={ DISPLAY_MODE_OPTIONS }
				onChange={ ( val ) => set( 'displayMode', val ) }
			/>

			{ isRotation && (
				<>
					<RangeControl
						label={ __( 'Rotation interval (seconds)', 'notibar' ) }
						value={ value.rotationIntervalSeconds ?? 5 }
						onChange={ ( val ) =>
							set( 'rotationIntervalSeconds', val )
						}
						min={ 2 }
						max={ 60 }
						step={ 1 }
					/>

					<ToggleControl
						label={ __( 'Pause rotation on hover', 'notibar' ) }
						checked={ value.rotationPauseOnHover ?? true }
						onChange={ ( val ) =>
							set( 'rotationPauseOnHover', val )
						}
					/>

					<RadioControl
						label={ __( 'Rotation order', 'notibar' ) }
						selected={ value.rotationOrder ?? 'sequential' }
						options={ ROTATION_ORDER_OPTIONS }
						onChange={ ( val ) => set( 'rotationOrder', val ) }
					/>
				</>
			) }
		</div>
	);
}
