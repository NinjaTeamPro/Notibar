/**
 * ButtonSubForm — reusable button sub-form block.
 *
 * Renders an "Enable button" toggle, and when enabled shows:
 * action (open link | close bar), text, font weight (SelectControl 100-900),
 * plus URL + open-in-new-tab toggle when the action is "open link".
 *
 * Used for both desktop and mobile button fields in ContentTab.
 */
import {
	ToggleControl,
	TextControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

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

// Click action for the button: open a URL, or dismiss the bar.
const ACTION_OPTIONS = [
	{ value: 'link', label: __( 'Open link', 'notibar' ) },
	{ value: 'close', label: __( 'Close bar', 'notibar' ) },
];

// Pro CTA animations. Values match the schema whitelist + CSS class suffixes.
const ATTENTION_OPTIONS = [
	{ value: 'none', label: __( 'None', 'notibar' ) },
	{ value: 'wobble', label: __( 'Wobble', 'notibar' ) },
	{ value: 'shake', label: __( 'Shake', 'notibar' ) },
	{ value: 'bounce', label: __( 'Bounce', 'notibar' ) },
	{ value: 'pulse', label: __( 'Pulse', 'notibar' ) },
	{ value: 'swing', label: __( 'Swing', 'notibar' ) },
	{ value: 'jello', label: __( 'Jello', 'notibar' ) },
	{ value: 'tada', label: __( 'Tada', 'notibar' ) },
	{ value: 'rubber-band', label: __( 'Rubber Band', 'notibar' ) },
	{ value: 'heartbeat', label: __( 'Heartbeat', 'notibar' ) },
	{ value: 'flash', label: __( 'Flash', 'notibar' ) },
	{ value: 'blink', label: __( 'Blink', 'notibar' ) },
	{ value: 'vibrate', label: __( 'Vibrate', 'notibar' ) },
	{ value: 'pop', label: __( 'Pop', 'notibar' ) },
	{ value: 'bounce-in', label: __( 'Bounce In', 'notibar' ) },
];

const HOVER_OPTIONS = [
	{ value: 'none', label: __( 'None', 'notibar' ) },
	{ value: 'grow', label: __( 'Grow', 'notibar' ) },
	{ value: 'shrink', label: __( 'Shrink', 'notibar' ) },
	{ value: 'lift', label: __( 'Lift', 'notibar' ) },
	{ value: 'glow', label: __( 'Glow', 'notibar' ) },
	{ value: 'press', label: __( 'Press', 'notibar' ) },
	{ value: 'shadow', label: __( 'Shadow', 'notibar' ) },
	{ value: 'color-shift', label: __( 'Color Shift', 'notibar' ) },
	{ value: 'slide-fill', label: __( 'Slide Fill', 'notibar' ) },
];

/**
 * @param {Object}   props
 * @param {string}   props.label    Section heading (e.g. "Button" or "Mobile button").
 * @param {Object}   props.value    Button object { enabled, text, url, fontWeight, newWindow, action, attention, hover }.
 * @param {Function} props.onChange Called with updated button object.
 */
export function ButtonSubForm( { label, value, onChange } ) {
	function set( key, val ) {
		onChange( { ...value, [ key ]: val } );
	}

	// Pro gate: animation controls stay visible in Lite but locked + upsell.
	const pro = isProEdition();

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

	// 'link' is the implicit default for buttons saved before the action field
	// existed, so treat a missing action as a link.
	const isLink = ( value.action || 'link' ) !== 'close';

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
					<SelectControl
						label={ __( 'Action', 'notibar' ) }
						value={ value.action || 'link' }
						options={ ACTION_OPTIONS }
						onChange={ ( v ) => set( 'action', v ) }
						help={
							isLink
								? undefined
								: __(
										'Clicking this button dismisses the bar.',
										'notibar'
								  )
						}
					/>

					<TextControl
						label={ __( 'Button text', 'notibar' ) }
						value={ value.text || '' }
						onChange={ ( v ) => set( 'text', v ) }
					/>

					{ isLink && (
						<TextControl
							label={ __( 'URL', 'notibar' ) }
							value={ value.url || '' }
							type="url"
							onChange={ ( v ) => set( 'url', v ) }
							help={
								! isValidUrl( value.url )
									? __(
											'Please enter a valid URL.',
											'notibar'
									  )
									: undefined
							}
							className={
								! isValidUrl( value.url ) ? 'is-invalid' : ''
							}
						/>
					) }

					<SelectControl
						label={ __( 'Font weight', 'notibar' ) }
						value={ value.fontWeight || 500 }
						options={ FONT_WEIGHT_OPTIONS }
						onChange={ ( v ) =>
							set( 'fontWeight', parseInt( v, 10 ) )
						}
					/>

					{ ! pro && (
						<ProUpgradeNotice
							feature={ __( 'Button animations', 'notibar' ) }
						/>
					) }
					<SelectControl
						label={ __( 'Attention animation', 'notibar' ) }
						value={ value.attention || 'none' }
						options={ ATTENTION_OPTIONS }
						disabled={ ! pro }
						onChange={ ( v ) => set( 'attention', v ) }
					/>
					<SelectControl
						label={ __( 'Hover effect', 'notibar' ) }
						value={ value.hover || 'none' }
						options={ HOVER_OPTIONS }
						disabled={ ! pro }
						onChange={ ( v ) => set( 'hover', v ) }
					/>

					{ isLink && (
						<ToggleControl
							label={ __( 'Open in new tab', 'notibar' ) }
							checked={ !! value.newWindow }
							onChange={ ( v ) => set( 'newWindow', v ) }
						/>
					) }
				</div>
			) }
		</fieldset>
	);
}
