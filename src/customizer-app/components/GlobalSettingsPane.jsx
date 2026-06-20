/**
 * GlobalSettingsPane — display mode + rotation controls.
 *
 * Pro feature. In Lite (isProEdition() === false) the whole pane is shown but
 * locked with a Pro badge; displayMode stays 'single' (the engine is stripped).
 * The rotation interval/order controls are shown as a locked teaser in Lite and
 * only when displayMode === 'rotation' in Pro.
 */
import { __ } from '@wordpress/i18n';
import {
	RadioControl,
	RangeControl,
	ToggleControl,
} from '@wordpress/components';
import { isProEdition, ProUpgradeNotice } from '../../shared/pro-ui';

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
	const pro = isProEdition();
	const isRotation = value.displayMode === 'rotation';
	const set = ( key, val ) => onChange( { ...value, [ key ]: val } );

	// Lite shows the rotation controls as a locked teaser even though
	// displayMode stays 'single' (the locked wrapper blocks interaction).
	const showRotationControls = isRotation || ! pro;

	return (
		<div className="njt-notibar-global-settings">
			{ ! pro && (
				<ProUpgradeNotice
					feature={ __( 'Rotation mode & A/B testing', 'notibar' ) }
				/>
			) }
			<div className={ pro ? undefined : 'njt-pro-locked' }>
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

				{ showRotationControls && (
					<>
						<RangeControl
							label={ __(
								'Rotation interval (seconds)',
								'notibar'
							) }
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

						<ToggleControl
							label={ __( 'Show navigation arrows', 'notibar' ) }
							help={ __(
								'Let visitors step between bars with prev/next arrows.',
								'notibar'
							) }
							checked={ value.rotationShowArrows ?? true }
							onChange={ ( val ) =>
								set( 'rotationShowArrows', val )
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
		</div>
	);
}
