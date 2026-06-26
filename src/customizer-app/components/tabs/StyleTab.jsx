/**
 * StyleTab — Style tab inside BarEditor.
 *
 * Fields: color presets, 4 × ColorFieldWithReset, font size, layout,
 * content width, position type. Two ContrastWarning blocks (required).
 * Each ContrastWarning is placed directly below its colour pair so the
 * warning is contextually adjacent to the controls that produced it.
 */
import { RangeControl, ButtonGroup, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { DEFAULT_BAR } from '../../utils/defaults';
import { ColorPresetSwatches } from '../fields/ColorPresetSwatches';
import { ColorFieldWithReset } from '../fields/ColorFieldWithReset';
import { ContrastWarning } from '../fields/ContrastWarning';
import { LayoutPicker } from '../fields/LayoutPicker';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const POSITION_OPTIONS = [
	{ value: 'fixed', label: __( 'Fixed', 'notibar' ) },
	{ value: 'absolute', label: __( 'Absolute', 'notibar' ) },
];

const PLACEMENT_OPTIONS = [
	{ value: 'top', label: __( 'Top', 'notibar' ) },
	{ value: 'bottom', label: __( 'Bottom', 'notibar' ) },
];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with updated bar.
 */
export function StyleTab( { bar, onChange } ) {
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { style } = bar;
	const pro = isProEdition();
	const placement = style.placement || 'top';
	const activePreset = style.activePreset || null;

	// Per-colour Reset targets: when a preset is active, Reset restores that
	// preset's colours; otherwise it falls back to the global defaults.
	const resetBg = activePreset ? activePreset.bg : DEFAULT_BAR.style.bgColor;
	const resetText = activePreset
		? activePreset.text
		: DEFAULT_BAR.style.textColor;
	const resetBtnBg = activePreset
		? activePreset.btnBg
		: DEFAULT_BAR.style.btnBgColor;
	const resetBtnText = activePreset
		? activePreset.btnText
		: DEFAULT_BAR.style.btnTextColor;

	function handlePreset( preset ) {
		// Write all 4 colours AND the active-preset snapshot in ONE onChange
		// call (single Customizer dirty event). The snapshot becomes the new
		// Reset target and marks this swatch as selected.
		let next = updatePath( bar, 'style.bgColor', preset.bg );
		next = updatePath( next, 'style.textColor', preset.text );
		next = updatePath( next, 'style.btnBgColor', preset.btnBg );
		next = updatePath( next, 'style.btnTextColor', preset.btnText );
		next = updatePath( next, 'style.activePreset', {
			bg: preset.bg,
			text: preset.text,
			btnBg: preset.btnBg,
			btnText: preset.btnText,
			...( preset.name ? { name: preset.name } : {} ),
		} );
		onChange( next );
	}

	return (
		<div className="njt-notibar-tab-content">
			{ /* Color presets */ }
			<ColorPresetSwatches
				onSelect={ handlePreset }
				activePreset={ activePreset }
			/>

			{ /* Bar colour pair + contrast check */ }
			<div className="njt-notibar-color-fields">
				<ColorFieldWithReset
					label={ __( 'Background colour', 'notibar' ) }
					value={ style.bgColor }
					onChange={ ( v ) => set( 'style.bgColor', v ) }
					defaultValue={ resetBg }
					enableAlpha
				/>
				<ColorFieldWithReset
					label={ __( 'Text colour', 'notibar' ) }
					value={ style.textColor }
					onChange={ ( v ) => set( 'style.textColor', v ) }
					defaultValue={ resetText }
				/>
			</div>
			<ContrastWarning
				bg={ style.bgColor }
				fg={ style.textColor }
				pairLabel={ __( 'bar bg vs text', 'notibar' ) }
			/>

			{ /* Button colour pair + contrast check */ }
			<div className="njt-notibar-color-fields">
				<ColorFieldWithReset
					label={ __( 'Button background', 'notibar' ) }
					value={ style.btnBgColor }
					onChange={ ( v ) => set( 'style.btnBgColor', v ) }
					defaultValue={ resetBtnBg }
					enableAlpha
				/>
				<ColorFieldWithReset
					label={ __( 'Button text colour', 'notibar' ) }
					value={ style.btnTextColor }
					onChange={ ( v ) => set( 'style.btnTextColor', v ) }
					defaultValue={ resetBtnText }
				/>
			</div>
			<ContrastWarning
				bg={ style.btnBgColor }
				fg={ style.btnTextColor }
				pairLabel={ __( 'button bg vs button text', 'notibar' ) }
			/>

			{ /* Overall opacity — fades the whole bar (bg + text + button) */ }
			<RangeControl
				label={ __( 'Opacity (%)', 'notibar' ) }
				value={ style.opacity ?? 100 }
				onChange={ ( v ) => set( 'style.opacity', v ) }
				min={ 10 }
				max={ 100 }
				step={ 1 }
			/>

			{ /* Font size */ }
			<RangeControl
				label={ __( 'Font size (px)', 'notibar' ) }
				value={ style.fontSize }
				onChange={ ( v ) => set( 'style.fontSize', v ) }
				min={ 8 }
				max={ 72 }
				step={ 1 }
			/>

			{ /* Layout — visual picker replacing the old alignment control. */ }
			<LayoutPicker
				value={ style.layout }
				onChange={ ( v ) => set( 'style.layout', v ) }
			/>

			{ /* Content width */ }
			<RangeControl
				label={ __( 'Content width (px)', 'notibar' ) }
				value={ style.contentWidth }
				onChange={ ( v ) => set( 'style.contentWidth', v ) }
				min={ 100 }
				max={ 3000 }
				step={ 10 }
			/>

			{ /* Position type */ }
			<div className="njt-notibar-button-group-field">
				<span className="njt-notibar-button-group-field__label">
					{ __( 'Position', 'notibar' ) }
				</span>
				<ButtonGroup>
					{ POSITION_OPTIONS.map( ( opt ) => (
						<Button
							key={ opt.value }
							variant={
								style.positionType === opt.value
									? 'primary'
									: 'secondary'
							}
							onClick={ () =>
								set( 'style.positionType', opt.value )
							}
							size="small"
						>
							{ opt.label }
						</Button>
					) ) }
				</ButtonGroup>
			</div>

			{ /* Placement (Pro) — top/bottom of the screen */ }
			<div className="njt-notibar-button-group-field">
				<span className="njt-notibar-button-group-field__label">
					{ __( 'Placement', 'notibar' ) }
				</span>
				{ ! pro && (
					<ProUpgradeNotice
						feature={ __( 'Display bar at bottom', 'notibar' ) }
					/>
				) }
				<div className={ pro ? undefined : 'njt-pro-locked' }>
					<ButtonGroup>
						{ PLACEMENT_OPTIONS.map( ( opt ) => (
							<Button
								key={ opt.value }
								variant={
									placement === opt.value
										? 'primary'
										: 'secondary'
								}
								onClick={ () =>
									set( 'style.placement', opt.value )
								}
								size="small"
							>
								{ opt.label }
							</Button>
						) ) }
					</ButtonGroup>
				</div>
			</div>
		</div>
	);
}
