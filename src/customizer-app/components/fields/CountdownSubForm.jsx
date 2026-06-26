/**
 * CountdownSubForm — reusable countdown-timer sub-form block (Pro).
 *
 * Renders an "Enable countdown" toggle, and when enabled:
 *   - mode: fixed date (datetime-local) or evergreen (days/hours/minutes/seconds
 *     duration, stored as total seconds);
 *   - UI style: boxes | flip | circular | text;
 *   - which time units to display.
 *
 * Pro-gated: all controls are disabled in Lite with a Go-Pro notice (the render
 * + ticker are Pro-only and stripped from the Lite build).
 *
 * MIRROR: includes/NotificationBar/Schema.php ALLOWED_CD_TYPE / ALLOWED_CD_UI /
 * ALLOWED_CD_UNIT + defaultCountdown() — keep tokens in lockstep.
 */
import {
	ToggleControl,
	SelectControl,
	CheckboxControl,
	BaseControl,
	Button,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const TYPE_OPTIONS = [
	{ value: 'date', label: __( 'Fixed date & time', 'notibar' ) },
	{ value: 'evergreen', label: __( 'Evergreen (per visitor)', 'notibar' ) },
];

const UI_OPTIONS = [
	{ value: 'boxes', label: __( 'Boxes', 'notibar' ) },
	{ value: 'flip', label: __( 'Flip clock', 'notibar' ) },
	{ value: 'circular', label: __( 'Circular', 'notibar' ) },
	{ value: 'text', label: __( 'Text (with labels)', 'notibar' ) },
];

// Canonical unit order (matches Schema::ALLOWED_CD_UNIT).
const ALL_UNITS = [ 'days', 'hours', 'minutes', 'seconds' ];
const UNIT_LABELS = {
	days: __( 'Days', 'notibar' ),
	hours: __( 'Hours', 'notibar' ),
	minutes: __( 'Minutes', 'notibar' ),
	seconds: __( 'Seconds', 'notibar' ),
};

const MAX_DURATION = 2592000; // 30 days in seconds (matches Phase 1 sanitize).

/**
 * @param {Object}   props
 * @param {Object}   props.value    countdown object { enabled, type, endAt, duration, ui, units }.
 * @param {Function} props.onChange Called with the updated countdown object.
 */
export function CountdownSubForm( { value, onChange } ) {
	const cd = value || {};

	function set( key, val ) {
		onChange( { ...cd, [ key ]: val } );
	}

	const pro = isProEdition();
	const type = cd.type === 'evergreen' ? 'evergreen' : 'date';

	// Derive d/h/m/s display from the stored total-seconds duration.
	const dur = Math.max( 0, Number( cd.duration ) || 0 );
	const parts = {
		days: Math.floor( dur / 86400 ),
		hours: Math.floor( ( dur % 86400 ) / 3600 ),
		minutes: Math.floor( ( dur % 3600 ) / 60 ),
		seconds: dur % 60,
	};

	function setDurationPart( part, raw ) {
		const next = {
			...parts,
			[ part ]: Math.max( 0, parseInt( raw, 10 ) || 0 ),
		};
		const total =
			next.days * 86400 +
			next.hours * 3600 +
			next.minutes * 60 +
			next.seconds;
		set( 'duration', Math.min( MAX_DURATION, total ) );
	}

	const units = Array.isArray( cd.units ) ? cd.units : [];

	function toggleUnit( unit, checked ) {
		const merged = checked
			? [ ...units, unit ]
			: units.filter( ( u ) => u !== unit );
		// Re-order to canonical and drop dupes.
		const ordered = ALL_UNITS.filter( ( u ) => merged.includes( u ) );
		// Guard: never leave the timer with no units to show.
		if ( ! ordered.length ) {
			return;
		}
		set( 'units', ordered );
	}

	return (
		<fieldset className="njt-notibar-countdown-subform">
			{ ! pro && (
				<ProUpgradeNotice
					feature={ __( 'Countdown timer', 'notibar' ) }
				/>
			) }

			<ToggleControl
				label={ __( 'Countdown timer', 'notibar' ) }
				checked={ !! cd.enabled }
				disabled={ ! pro }
				onChange={ ( v ) => set( 'enabled', v ) }
				help={ __( 'Show a live countdown in the bar.', 'notibar' ) }
				className="njt-notibar-countdown-subform__toggle"
			/>

			{ cd.enabled && (
				<div className="njt-notibar-countdown-subform__fields">
					<SelectControl
						label={ __( 'Countdown to', 'notibar' ) }
						value={ type }
						options={ TYPE_OPTIONS }
						disabled={ ! pro }
						onChange={ ( v ) => set( 'type', v ) }
						help={
							type === 'evergreen'
								? __(
										'Each visitor gets their own window that continues across reloads.',
										'notibar'
								  )
								: __(
										'Counts to a fixed moment in the site timezone — the same for every visitor.',
										'notibar'
								  )
						}
					/>

					{ type === 'date' && (
						<BaseControl
							label={ __( 'End date & time', 'notibar' ) }
							id="njt-countdown-end-at"
						>
							<input
								id="njt-countdown-end-at"
								type="datetime-local"
								className="njt-notibar-datetime-input"
								value={ cd.endAt || '' }
								disabled={ ! pro }
								onChange={ ( e ) =>
									set( 'endAt', e.target.value )
								}
							/>
						</BaseControl>
					) }

					{ type === 'evergreen' && (
						<>
							<BaseControl
								label={ __( 'Duration', 'notibar' ) }
								id="njt-countdown-duration"
								help={ __(
									'Window length per visitor (max 30 days).',
									'notibar'
								) }
							>
								<div className="njt-notibar-countdown-subform__duration">
									{ ALL_UNITS.map( ( u ) => (
										<div
											key={ u }
											className="njt-notibar-countdown-subform__duration-field"
										>
											<span>{ UNIT_LABELS[ u ] }</span>
											<input
												type="number"
												className="njt-notibar-number-input"
												aria-label={ UNIT_LABELS[ u ] }
												value={ parts[ u ] }
												min={ 0 }
												step={ 1 }
												disabled={ ! pro }
												onChange={ ( e ) =>
													setDurationPart(
														u,
														e.target.value
													)
												}
											/>
										</div>
									) ) }
								</div>
							</BaseControl>
							<BaseControl
								id="njt-countdown-reset"
								help={ __(
									'Restarts every visitor’s timer from the full duration on their next visit (applies after you publish).',
									'notibar'
								) }
							>
								<Button
									variant="secondary"
									size="small"
									disabled={ ! pro }
									onClick={ () =>
										set( 'resetToken', Date.now() )
									}
								>
									{ __(
										'Reset visitors’ timers',
										'notibar'
									) }
								</Button>
							</BaseControl>
						</>
					) }

					<SelectControl
						label={ __( 'Style', 'notibar' ) }
						value={
							UI_OPTIONS.some( ( o ) => o.value === cd.ui )
								? cd.ui
								: 'boxes'
						}
						options={ UI_OPTIONS }
						disabled={ ! pro }
						onChange={ ( v ) => set( 'ui', v ) }
					/>

					<BaseControl
						label={ __( 'Show units', 'notibar' ) }
						id="njt-countdown-units"
					>
						<div className="njt-notibar-countdown-subform__units">
							{ ALL_UNITS.map( ( u ) => (
								<CheckboxControl
									key={ u }
									label={ UNIT_LABELS[ u ] }
									checked={ units.includes( u ) }
									disabled={ ! pro }
									onChange={ ( checked ) =>
										toggleUnit( u, checked )
									}
								/>
							) ) }
						</div>
					</BaseControl>

					<ToggleControl
						label={ __(
							'Always show all selected units',
							'notibar'
						) }
						checked={ !! cd.showAllUnits }
						disabled={ ! pro }
						onChange={ ( v ) => set( 'showAllUnits', v ) }
						help={ __(
							'Off: hides leading units that are zero at load (e.g. “00 days”). On: always shows every selected unit.',
							'notibar'
						) }
					/>
				</div>
			) }
		</fieldset>
	);
}
