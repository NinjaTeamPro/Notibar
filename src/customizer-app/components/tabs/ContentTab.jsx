/**
 * ContentTab — Content tab inside BarEditor.
 *
 * Fields: bar name, text, mobile-separate toggle + conditional mobile text,
 * desktop button sub-form, conditional mobile button sub-form. Each text field
 * gets a DynamicTagPicker ("Insert variable") for server-side merge tags (Pro).
 */
import {
	TextControl,
	TextareaControl,
	ToggleControl,
	Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { ButtonSubForm } from '../fields/ButtonSubForm';
import { DynamicTagPicker } from '../fields/DynamicTagPicker';

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object.
 * @param {Function} props.onChange Called with updated bar.
 */
export function ContentTab( { bar, onChange } ) {
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );

	const { content } = bar;
	const textEmpty = ! content.text || content.text.trim() === '';

	// Curried: append a chosen token to a text field (space-separated when the
	// field already has content). `current` is the field's value at render.
	const insertInto = ( path, current ) => ( token ) =>
		set( path, current ? `${ current } ${ token }` : token );

	return (
		<div className="njt-notibar-tab-content">
			{ /* Bar name */ }
			<TextControl
				label={ __( 'Bar name', 'notibar' ) }
				value={ bar.name || '' }
				onChange={ ( v ) => set( 'name', v.slice( 0, 100 ) ) }
				help={ __(
					'Internal label — not shown to visitors.',
					'notibar'
				) }
				maxLength={ 100 }
			/>

			{ /* Bar text */ }
			<TextareaControl
				label={ __( 'Text', 'notibar' ) }
				value={ content.text || '' }
				onChange={ ( v ) => set( 'content.text', v ) }
				help={ __( 'HTML and shortcodes accepted.', 'notibar' ) }
				rows={ 3 }
			/>

			{ textEmpty && (
				<Notice
					status="warning"
					isDismissible={ false }
					className="njt-notibar-inline-notice"
				>
					{ __(
						'Text is empty — bar will render empty.',
						'notibar'
					) }
				</Notice>
			) }

			{ /* Insert variable (Pro) — desktop text. Carries the notice + help. */ }
			<DynamicTagPicker
				withHelp
				onInsert={ insertInto( 'content.text', content.text ) }
			/>

			{ /* Mobile separate toggle */ }
			<ToggleControl
				label={ __( 'Different content on mobile', 'notibar' ) }
				checked={ !! content.mobileSeparate }
				onChange={ ( v ) => set( 'content.mobileSeparate', v ) }
				help={ __(
					'When on, mobile visitors see separate text and button.',
					'notibar'
				) }
			/>

			{ content.mobileSeparate && (
				<>
					<TextareaControl
						label={ __( 'Mobile text', 'notibar' ) }
						value={ content.textMobile || '' }
						onChange={ ( v ) => set( 'content.textMobile', v ) }
						help={ __(
							'HTML and shortcodes accepted.',
							'notibar'
						) }
						rows={ 3 }
					/>
					{ /* Insert variable (Pro) — mobile text. */ }
					<DynamicTagPicker
						onInsert={ insertInto(
							'content.textMobile',
							content.textMobile
						) }
					/>
				</>
			) }

			{ /* Desktop button — also serves mobile when mobileSeparate is off. */ }
			<ButtonSubForm
				label={
					content.mobileSeparate
						? __( 'Desktop button', 'notibar' )
						: __( 'Show button', 'notibar' )
				}
				value={ content.button }
				onChange={ ( updated ) => set( 'content.button', updated ) }
			/>

			{ /* Mobile button — only when mobileSeparate is on. */ }
			{ content.mobileSeparate && (
				<ButtonSubForm
					label={ __( 'Mobile button', 'notibar' ) }
					value={ content.buttonMobile }
					onChange={ ( updated ) =>
						set( 'content.buttonMobile', updated )
					}
				/>
			) }
		</div>
	);
}
