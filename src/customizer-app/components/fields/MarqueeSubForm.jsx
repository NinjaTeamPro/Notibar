/**
 * MarqueeSubForm — reusable content-scroll (marquee) sub-form block (Pro).
 *
 * Renders a "Scroll content continuously" toggle, and when enabled:
 *   - scope: whether the whole content row scrolls, or only the text;
 *   - speed in pixels per second (not seconds per loop — marquee.js divides the
 *     measured distance by this, so the same value scrolls a short bar and a
 *     long bar at the same rate);
 *   - scroll direction: left | right.
 *
 * Pro-gated: all controls are disabled in Lite with a Go-Pro notice (the render
 * wrapper + measurement shim are Pro-only and stripped from the Lite build).
 *
 * The two scopes interact differently with the layout controls, which is why
 * the toggle's help text branches:
 *   - row:  the track is wider than the bar, so `style.layout` and
 *           `style.contentWidth` stop having any effect.
 *   - text: `style.contentWidth` still applies, and `style.layout` partly does
 *           — the text zone grows to fill the row, so the layouts that cluster
 *           content no longer cluster.
 *
 * MIRROR: includes/NotificationBar/Schema.php ALLOWED_MARQUEE_DIR /
 * ALLOWED_MARQUEE_SCOPE + defaultBar().style.marquee — keep tokens and the
 * 10–300 clamp in lockstep.
 */
import {
	ToggleControl,
	RangeControl,
	ButtonGroup,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const DIR_OPTIONS = [
	{ value: 'left', label: __( 'Left', 'notibar' ) },
	{ value: 'right', label: __( 'Right', 'notibar' ) },
];

const SCOPE_OPTIONS = [
	{ value: 'row', label: __( 'Whole row', 'notibar' ) },
	{ value: 'text', label: __( 'Text only', 'notibar' ) },
];

const MODE_OPTIONS = [
	{ value: 'loop', label: __( 'Continuous', 'notibar' ) },
	{
		value: 'rest-then-scroll',
		label: __( 'Start visible', 'notibar' ),
	},
];

// Mirrors Schema::sanitizeStyle's marquee.delay clamp.
const DELAY_MIN = 0;
const DELAY_MAX = 10;

// Mirrors Schema::sanitizeStyle's marquee clamp and marquee.js's own guard.
const SPEED_MIN = 10;
const SPEED_MAX = 300;

/**
 * @param {Object}   props
 * @param {Object}   props.value    bar.style.marquee ({ enabled, speed, direction }).
 * @param {Function} props.onChange Called with the updated marquee object.
 *
 * @return {JSX.Element} The content-scroll sub-form.
 */
export function MarqueeSubForm( { value, onChange } ) {
	const mq = value || {};
	const pro = isProEdition();
	const direction = mq.direction === 'right' ? 'right' : 'left';
	const scope = mq.scope === 'text' ? 'text' : 'row';
	const mode = mq.mode === 'rest-then-scroll' ? 'rest-then-scroll' : 'loop';

	function set( key, val ) {
		onChange( { ...mq, [ key ]: val } );
	}

	// Which layout controls the chosen scope actually disables. Row voids both;
	// text keeps the width cap and only breaks the clustering layouts.
	const scopeHelp =
		scope === 'text'
			? __(
					'Layout and content width still apply, but the text fills the row, so layouts that cluster content no longer cluster.',
					'notibar'
			  )
			: __(
					'Layout and content width do not apply while the whole row is scrolling.',
					'notibar'
			  );

	return (
		<div className="njt-notibar-button-group-field">
			<span className="njt-notibar-button-group-field__label">
				{ __( 'Content scroll', 'notibar' ) }
			</span>
			{ ! pro && (
				<ProUpgradeNotice
					feature={ __( 'Scrolling bar content', 'notibar' ) }
				/>
			) }
			<div className={ pro ? undefined : 'njt-pro-locked' } style={{display: 'flex', 'flexDirection': 'column', gap: 10}}>
				<ToggleControl
					label={ __( 'Scroll content continuously', 'notibar' ) }
					checked={ !! mq.enabled }
					onChange={ ( v ) => set( 'enabled', v ) }
					help={ mq.enabled ? scopeHelp : undefined }
				/>
				{ mq.enabled && (
					<>
						<div className="njt-notibar-button-group-field">
							<span className="njt-notibar-button-group-field__label">
								{ __( 'Scroll', 'notibar' ) }
							</span>
							<ButtonGroup>
								{ SCOPE_OPTIONS.map( ( opt ) => (
									<Button
										key={ opt.value }
										variant={
											scope === opt.value
												? 'primary'
												: 'secondary'
										}
										onClick={ () =>
											set( 'scope', opt.value )
										}
										size="small"
									>
										{ opt.label }
									</Button>
								) ) }
							</ButtonGroup>
						</div>
						<div className="njt-notibar-button-group-field">
							<span className="njt-notibar-button-group-field__label">
								{ __( 'Start', 'notibar' ) }
							</span>
							<ButtonGroup>
								{ MODE_OPTIONS.map( ( opt ) => (
									<Button
										key={ opt.value }
										variant={
											mode === opt.value
												? 'primary'
												: 'secondary'
										}
										onClick={ () =>
											set( 'mode', opt.value )
										}
										size="small"
									>
										{ opt.label }
									</Button>
								) ) }
							</ButtonGroup>
						</div>
						{ mode === 'rest-then-scroll' && (
							<RangeControl
								label={ __(
									'Pause before first scroll (seconds)',
									'notibar'
								) }
								help={ __(
									'Applies once, when the bar first appears. Later laps scroll without pausing.',
									'notibar'
								) }
								value={ mq.delay }
								onChange={ ( v ) => set( 'delay', v ) }
								min={ DELAY_MIN }
								max={ DELAY_MAX }
								step={ 1 }
							/>
						) }
						<RangeControl
							label={ __( 'Scroll speed (px/sec)', 'notibar' ) }
							value={ mq.speed }
							onChange={ ( v ) => set( 'speed', v ) }
							min={ SPEED_MIN }
							max={ SPEED_MAX }
							step={ 5 }
						/>
						<div className="njt-notibar-button-group-field">
							<span className="njt-notibar-button-group-field__label">
								{ __( 'Direction', 'notibar' ) }
							</span>
							<ButtonGroup>
								{ DIR_OPTIONS.map( ( opt ) => (
									<Button
										key={ opt.value }
										variant={
											direction === opt.value
												? 'primary'
												: 'secondary'
										}
										onClick={ () =>
											set( 'direction', opt.value )
										}
										size="small"
									>
										{ opt.label }
									</Button>
								) ) }
							</ButtonGroup>
						</div>
					</>
				) }
			</div>
		</div>
	);
}
