/**
 * ButtonSubForm — reusable button sub-form block.
 *
 * Renders an "Enable button" toggle, and when enabled shows:
 * text, URL, font weight (SelectControl 100-900), open-in-new-tab toggle.
 *
 * Used for both desktop and mobile button fields in ContentTab.
 */
import {
	ToggleControl,
	TextControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const FONT_WEIGHT_OPTIONS = [
	{ value: 100, label: '100 — Thin' },
	{ value: 200, label: '200 — ExtraLight' },
	{ value: 300, label: '300 — Light' },
	{ value: 400, label: '400 — Regular' },
	{ value: 500, label: '500 — Medium' },
	{ value: 600, label: '600 — SemiBold' },
	{ value: 700, label: '700 — Bold' },
	{ value: 800, label: '800 — ExtraBold' },
	{ value: 900, label: '900 — Black' },
];

/**
 * @param {Object}   props
 * @param {string}   props.label    Section heading (e.g. "Button" or "Mobile button").
 * @param {Object}   props.value    Button object { enabled, text, url, fontWeight, newWindow }.
 * @param {Function} props.onChange Called with updated button object.
 */
export function ButtonSubForm( { label, value, onChange } ) {
	function set( key, val ) {
		onChange( { ...value, [ key ]: val } );
	}

	const isValidUrl = ( url ) => {
		if ( ! url ) {
			return true;
		}
		try {
			new URL( url );
			return true;
		} catch {
			return false;
		}
	};

	return (
		<fieldset className="njt-notibar-button-subform">
			{ /* The toggle's label IS the section header — no separate legend.
			     `label` prop is used for the toggle text so "Button" /
			     "Mobile button" appears once, attached to its switch. */ }
			<ToggleControl
				label={ label }
				checked={ !! value.enabled }
				onChange={ ( v ) => set( 'enabled', v ) }
				className="njt-notibar-button-subform__toggle"
			/>

			{ value.enabled && (
				<div className="njt-notibar-button-subform__fields">
					<TextControl
						label={ __( 'Button text', 'notibar' ) }
						value={ value.text || '' }
						onChange={ ( v ) => set( 'text', v ) }
					/>

					<TextControl
						label={ __( 'URL', 'notibar' ) }
						value={ value.url || '' }
						type="url"
						onChange={ ( v ) => set( 'url', v ) }
						help={
							! isValidUrl( value.url )
								? __( 'Please enter a valid URL.', 'notibar' )
								: undefined
						}
						className={
							! isValidUrl( value.url ) ? 'is-invalid' : ''
						}
					/>

					<SelectControl
						label={ __( 'Font weight', 'notibar' ) }
						value={ value.fontWeight || 500 }
						options={ FONT_WEIGHT_OPTIONS }
						onChange={ ( v ) =>
							set( 'fontWeight', parseInt( v, 10 ) )
						}
					/>

					<ToggleControl
						label={ __( 'Open in new tab', 'notibar' ) }
						checked={ !! value.newWindow }
						onChange={ ( v ) => set( 'newWindow', v ) }
					/>
				</div>
			) }
		</fieldset>
	);
}
