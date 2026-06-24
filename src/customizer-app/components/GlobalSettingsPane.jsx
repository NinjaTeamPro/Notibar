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
	{ label: __( 'Show all bars', 'notibar' ), value: 'stack' },
];

const ROTATION_ORDER_OPTIONS = [
	{ label: __( 'Sequential (list order)', 'notibar' ), value: 'sequential' },
	{ label: __( 'Random', 'notibar' ), value: 'random' },
];

// Stack mode applies ONE position type to the whole stack (per-bar positionType
// is ignored). 'fixed' stays pinned on scroll; 'absolute' scrolls away.
const STACK_POSITION_OPTIONS = [
	{ label: __( 'Fixed (stays on scroll)', 'notibar' ), value: 'fixed' },
	{ label: __( 'Scroll away with page', 'notibar' ), value: 'absolute' },
];

/**
 * @param {Object}   props
 * @param {Object}   props.value    Global config object.
 * @param {Function} props.onChange Called with updated global config object.
 */
export function GlobalSettingsPane( { value, onChange } ) {
	const pro = isProEdition();
	const isRotation = value.displayMode === 'rotation';
	const isStack = value.displayMode === 'stack';
	const set = ( key, val ) => onChange( { ...value, [ key ]: val } );

	// Lite shows the rotation controls as a locked teaser even though
	// displayMode stays 'single' (the locked wrapper blocks interaction).
	const showRotationControls = isRotation || ! pro;

	let displayModeHelp;
	if ( isRotation ) {
		displayModeHelp = __(
			'Bars rotate one at a time on a timer.',
			'notibar'
		);
	} else if ( isStack ) {
		displayModeHelp = __(
			'All matching bars show at once, stacked vertically.',
			'notibar'
		);
	} else {
		displayModeHelp = __(
			'Show one bar at a time, picked by order.',
			'notibar'
		);
	}

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
					help={ displayModeHelp }
					selected={ value.displayMode ?? 'single' }
					options={ DISPLAY_MODE_OPTIONS }
					onChange={ ( val ) => set( 'displayMode', val ) }
				/>

				{ isStack && (
					<RadioControl
						label={ __( 'Stack position', 'notibar' ) }
						help={ __(
							'Applies to the whole stack; individual bar position is ignored.',
							'notibar'
						) }
						selected={ value.stackPositionType ?? 'fixed' }
						options={ STACK_POSITION_OPTIONS }
						onChange={ ( val ) => set( 'stackPositionType', val ) }
					/>
				) }

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
