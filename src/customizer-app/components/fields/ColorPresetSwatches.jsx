/**
 * ColorPresetSwatches — quick-select color preset buttons.
 *
 * Reads presets from window.njtNotibarBoot.colorPresets.
 * Each preset is { bg, text, btnBg, btnText, name? }.
 *
 * Clicking a swatch calls onSelect(preset) which the parent uses to
 * write ALL 4 colours in ONE onChange call (one Customizer dirty event).
 * The swatch matching activePreset is marked selected (ring highlight).
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
 * Whether a preset matches the active snapshot (case-insensitive on all four
 * colour channels). The match is colour-based so it survives preset reordering
 * and works for legacy presets that have no name.
 *
 * @param {Object}      preset Preset to test.
 * @param {Object|null} active Active preset snapshot, or null.
 * @return {boolean} True when every colour channel matches.
 */
function isActivePreset( preset, active ) {
	if ( ! active ) {
		return false;
	}
	return [ 'bg', 'text', 'btnBg', 'btnText' ].every(
		( k ) =>
			String( preset[ k ] || '' ).toLowerCase() ===
			String( active[ k ] || '' ).toLowerCase()
	);
}

/**
 * @param {Object}      props
 * @param {Function}    props.onSelect     Called with preset { bg, text, btnBg, btnText }.
 * @param {Object|null} props.activePreset Snapshot of the currently selected preset.
 */
export function ColorPresetSwatches( { onSelect, activePreset = null } ) {
	if ( ! presets.length ) {
		return null;
	}

	return (
		<div className="njt-notibar-presets">
			<p className="njt-notibar-presets__label">
				{ __( 'Color presets', 'notibar' ) }
			</p>
			<div className="njt-notibar-presets__grid">
				{ presets.map( ( preset, i ) => {
					// Named tones (curated palette) show their name on hover;
					// legacy unnamed presets fall back to a numbered label.
					const label =
						preset.name ||
						`${ __( 'Preset', 'notibar' ) } ${ i + 1 }`;
					const isActive = isActivePreset( preset, activePreset );
					return (
						<button
							key={ i }
							type="button"
							className={
								'njt-notibar-presets__swatch' +
								( isActive
									? ' njt-notibar-presets__swatch--active'
									: '' )
							}
							style={ {
								background: quadGradient( preset ),
							} }
							data-tooltip={ label }
							aria-pressed={ isActive }
							aria-label={ `${ __(
								'Apply color preset',
								'notibar'
							) }: ${ label }` }
							onClick={ () => onSelect( preset ) }
						/>
					);
				} ) }
			</div>
		</div>
	);
}
