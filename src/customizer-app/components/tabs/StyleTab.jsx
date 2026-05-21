/**
 * StyleTab — Style tab inside BarEditor.
 *
 * Fields: color presets, 4 × ColorFieldWithReset, font size, alignment,
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

const ALIGNMENT_OPTIONS = [
	{ value: 'left', label: __( 'Left', 'notibar' ) },
	{ value: 'center', label: __( 'Center', 'notibar' ) },
	{ value: 'right', label: __( 'Right', 'notibar' ) },
	{ value: 'space-around', label: __( 'Space around', 'notibar' ) },
];

const POSITION_OPTIONS = [
	{ value: 'fixed', label: __( 'Fixed', 'notibar' ) },
	{ value: 'absolute', label: __( 'Absolute', 'notibar' ) },
];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with updated bar.
 */
export function StyleTab( { bar, onChange } ) {
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { style } = bar;

	function handlePreset( preset ) {
		// Write all 4 colours in ONE onChange call (single Customizer dirty event).
		onChange(
			updatePath(
				updatePath(
					updatePath(
						updatePath( bar, 'style.bgColor', preset.bg ),
						'style.textColor',
						preset.text
					),
					'style.btnBgColor',
					preset.btnBg
				),
				'style.btnTextColor',
				preset.btnText
			)
		);
	}

	return (
		<div className="njt-notibar-tab-content">
			{ /* Color presets */ }
			<ColorPresetSwatches onSelect={ handlePreset } />

			{ /* Bar colour pair + contrast check */ }
			<div className="njt-notibar-color-fields">
				<ColorFieldWithReset
					label={ __( 'Background colour', 'notibar' ) }
					value={ style.bgColor }
					onChange={ ( v ) => set( 'style.bgColor', v ) }
					defaultValue={ DEFAULT_BAR.style.bgColor }
				/>
				<ColorFieldWithReset
					label={ __( 'Text colour', 'notibar' ) }
					value={ style.textColor }
					onChange={ ( v ) => set( 'style.textColor', v ) }
					defaultValue={ DEFAULT_BAR.style.textColor }
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
					defaultValue={ DEFAULT_BAR.style.btnBgColor }
				/>
				<ColorFieldWithReset
					label={ __( 'Button text colour', 'notibar' ) }
					value={ style.btnTextColor }
					onChange={ ( v ) => set( 'style.btnTextColor', v ) }
					defaultValue={ DEFAULT_BAR.style.btnTextColor }
				/>
			</div>
			<ContrastWarning
				bg={ style.btnBgColor }
				fg={ style.btnTextColor }
				pairLabel={ __( 'button bg vs button text', 'notibar' ) }
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

			{ /* Alignment */ }
			<div className="njt-notibar-button-group-field">
				<span className="njt-notibar-button-group-field__label">
					{ __( 'Alignment', 'notibar' ) }
				</span>
				<ButtonGroup>
					{ ALIGNMENT_OPTIONS.map( ( opt ) => (
						<Button
							key={ opt.value }
							variant={
								style.alignment === opt.value
									? 'primary'
									: 'secondary'
							}
							onClick={ () =>
								set( 'style.alignment', opt.value )
							}
							size="small"
						>
							{ opt.label }
						</Button>
					) ) }
				</ButtonGroup>
			</div>

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
		</div>
	);
}
