/**
 * ColorPresetSwatches — 8 quick-select color preset buttons.
 *
 * Reads presets from window.njtNotibarBoot.colorPresets.
 * Each preset is { bg, text, btnBg, btnText }.
 *
 * Clicking a swatch calls onSelect(preset) which the parent uses to
 * write ALL 4 colours in ONE onChange call (one Customizer dirty event).
 */
import { __ } from '@wordpress/i18n';

const presets =
	( window.njtNotibarBoot && window.njtNotibarBoot.colorPresets ) || [];

/**
 * Build a CSS linear-gradient showing all 4 preset colours as quadrants.
 *
 * @param {Object} p Preset { bg, btnBg }.
 * @return {string} CSS gradient string.
 */
function quadGradient( p ) {
	return `linear-gradient(135deg, ${ p.bg } 0%, ${ p.bg } 50%, ${ p.btnBg } 50%, ${ p.btnBg } 100%)`;
}

/**
 * @param {Object}   props
 * @param {Function} props.onSelect Called with preset { bg, text, btnBg, btnText }.
 */
export function ColorPresetSwatches( { onSelect } ) {
	if ( ! presets.length ) {
		return null;
	}

	return (
		<div className="njt-notibar-presets">
			<p className="njt-notibar-presets__label">
				{ __( 'Color presets', 'notibar' ) }
			</p>
			<div className="njt-notibar-presets__grid">
				{ presets.map( ( preset, i ) => (
					<button
						key={ i }
						type="button"
						className="njt-notibar-presets__swatch"
						style={ { background: quadGradient( preset ) } }
						title={ `${ __( 'Preset', 'notibar' ) } ${ i + 1 }` }
						aria-label={ `${ __(
							'Apply color preset',
							'notibar'
						) } ${ i + 1 }` }
						onClick={ () => onSelect( preset ) }
					/>
				) ) }
			</div>
		</div>
	);
}
