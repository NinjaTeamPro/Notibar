/**
 * BehaviorTab — Behavior tab inside BarEditor.
 *
 * Fields:
 *   - hideCloseButton: 3-state RadioControl (close|toggle|disable)
 *   - reopenAfterDays: number input 0..365
 *   - schedule: master toggle + date range + day-of-week + daily window
 *   - trigger: display trigger (Pro) — type select (none|scroll|time|click) +
 *     conditional value input; defers the bar's reveal until the condition fires
 */
import {
	RadioControl,
	BaseControl,
	ToggleControl,
	CheckboxControl,
	SelectControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { updatePath } from '../../utils/update-path';
import { isProEdition, ProUpgradeNotice } from '../../../shared/pro-ui';

const CLOSE_BUTTON_OPTIONS = [
	{ value: 'close', label: __( '× Close button', 'notibar' ) },
	{ value: 'toggle', label: __( 'Collapse / expand arrow', 'notibar' ) },
	{ value: 'disable', label: __( 'No dismissal control', 'notibar' ) },
];

// Display trigger (Pro). type chooses when the bar reveals; value is reused per
// type with type-specific label + clamp. MIRROR: Schema.php ALLOWED_TRIGGER_TYPE
// + sanitizeBehavior clamps. Keep tokens in lockstep with the PHP enum.
const TRIGGER_OPTIONS = [
	{ value: 'none', label: __( 'Show immediately', 'notibar' ) },
	{ value: 'scroll', label: __( 'Show on scroll (% of page)', 'notibar' ) },
	{ value: 'time', label: __( 'Show after time (seconds)', 'notibar' ) },
	{ value: 'click', label: __( 'Show after clicks on the page', 'notibar' ) },
];
// Sensible default value per type, applied on type change.
const TRIGGER_DEFAULTS = { none: 0, scroll: 50, time: 5, click: 3 };
const TRIGGER_VALUE_META = {
	scroll: {
		label: __( 'Scroll percentage (%)', 'notibar' ),
		min: 1,
		max: 100,
	},
	time: { label: __( 'Delay (seconds)', 'notibar' ), min: 0, max: 3600 },
	click: { label: __( 'Number of clicks', 'notibar' ), min: 1, max: 100 },
};

// Sun..Sat — matches Schema.php daysOfWeek convention.
const WEEKDAY_OPTIONS = [
	{ value: 0, label: __( 'Sun', 'notibar' ) },
	{ value: 1, label: __( 'Mon', 'notibar' ) },
	{ value: 2, label: __( 'Tue', 'notibar' ) },
	{ value: 3, label: __( 'Wed', 'notibar' ) },
	{ value: 4, label: __( 'Thu', 'notibar' ) },
	{ value: 5, label: __( 'Fri', 'notibar' ) },
	{ value: 6, label: __( 'Sat', 'notibar' ) },
];

/**
 * @param {Object}   props
 * @param {Object}   props.bar      Bar object (behavior.hideCloseButton is 3-state enum).
 * @param {Function} props.onChange Called with updated bar.
 */
export function BehaviorTab( { bar, onChange } ) {
	const set = ( path, value ) => onChange( updatePath( bar, path, value ) );
	const { behavior } = bar;
	const schedule = bar.schedule || {};
	const dailyWindow = schedule.dailyWindow || {};
	const daysOfWeek = Array.isArray( schedule.daysOfWeek )
		? schedule.daysOfWeek
		: [ 0, 1, 2, 3, 4, 5, 6 ];
	const useClientTime = schedule.useClientTime === true;

	const isDismissalDisabled = behavior.hideCloseButton === 'disable';

	const pro = isProEdition();
	const trigger = behavior.trigger || { type: 'none', value: 0 };
	const triggerMeta = TRIGGER_VALUE_META[ trigger.type ];

	function handleDaysChange( e ) {
		const parsed = parseInt( e.target.value, 10 );
		if ( ! isNaN( parsed ) ) {
			set(
				'behavior.reopenAfterDays',
				Math.min( 365, Math.max( 0, parsed ) )
			);
		}
	}

	function toggleWeekday( day, checked ) {
		const next = checked
			? Array.from( new Set( [ ...daysOfWeek, day ] ) ).sort()
			: daysOfWeek.filter( ( d ) => d !== day );
		set( 'schedule.daysOfWeek', next );
	}

	return (
		<div className="njt-notibar-tab-content">
			<RadioControl
				label={ __( 'Dismissal control', 'notibar' ) }
				help={ __(
					'Determines what control, if any, visitors can use to dismiss the bar.',
					'notibar'
				) }
				selected={ behavior.hideCloseButton }
				options={ CLOSE_BUTTON_OPTIONS }
				onChange={ ( v ) => set( 'behavior.hideCloseButton', v ) }
			/>

			<BaseControl
				label={ __( 'Reopen after (days)', 'notibar' ) }
				help={
					isDismissalDisabled
						? __(
								'Not applicable when dismissal disabled.',
								'notibar'
						  )
						: __(
								'0 = never auto-reopen (cookie persists indefinitely).',
								'notibar'
						  )
				}
				id="njt-reopen-after-days"
			>
				<input
					id="njt-reopen-after-days"
					type="number"
					className="njt-notibar-number-input"
					value={ behavior.reopenAfterDays }
					min={ 0 }
					max={ 365 }
					step={ 1 }
					disabled={ isDismissalDisabled }
					onChange={ handleDaysChange }
				/>
			</BaseControl>

			{ /* Scheduling -------------------------------------------------- */ }
			<div className="njt-notibar-schedule">
				<ToggleControl
					label={ __( 'Schedule this bar', 'notibar' ) }
					help={
						useClientTime
							? __(
									"Times use each visitor's local device clock. Best for time-of-day content; not recommended for flash sales (Start/End dates become a rolling window across timezones).",
									'notibar'
							  )
							: __(
									'Times use the WordPress site timezone (Settings → General).',
									'notibar'
							  )
					}
					checked={ !! schedule.enabled }
					onChange={ ( v ) => set( 'schedule.enabled', v ) }
				/>

				{ schedule.enabled && (
					<div className="njt-notibar-schedule__body">
						{ /* Timezone source */ }
						<CheckboxControl
							label={ __(
								"Use visitor's local time",
								'notibar'
							) }
							help={ __(
								"When on, the bar shows when the visitor's device clock is inside the schedule window. Absolute Start/End dates become a rolling window across timezones.",
								'notibar'
							) }
							checked={ useClientTime }
							onChange={ ( v ) =>
								set( 'schedule.useClientTime', v )
							}
						/>

						{ /* Date range */ }
						<BaseControl
							label={ __( 'Starts on', 'notibar' ) }
							help={ __(
								'Leave empty to publish immediately.',
								'notibar'
							) }
							id="njt-schedule-start-at"
						>
							<input
								id="njt-schedule-start-at"
								type="datetime-local"
								className="njt-notibar-datetime-input"
								value={ schedule.startAt || '' }
								onChange={ ( e ) =>
									set( 'schedule.startAt', e.target.value )
								}
							/>
						</BaseControl>

						<BaseControl
							label={ __( 'Ends on', 'notibar' ) }
							help={ __(
								'Leave empty for no expiry.',
								'notibar'
							) }
							id="njt-schedule-end-at"
						>
							<input
								id="njt-schedule-end-at"
								type="datetime-local"
								className="njt-notibar-datetime-input"
								value={ schedule.endAt || '' }
								onChange={ ( e ) =>
									set( 'schedule.endAt', e.target.value )
								}
							/>
						</BaseControl>

						{ /* Day-of-week */ }
						<BaseControl
							label={ __( 'Show on days', 'notibar' ) }
							help={ __(
								'Bar only renders on selected weekdays.',
								'notibar'
							) }
							id="njt-schedule-days"
						>
							<div className="njt-notibar-schedule__days">
								{ WEEKDAY_OPTIONS.map( ( opt ) => (
									<CheckboxControl
										key={ opt.value }
										label={ opt.label }
										checked={ daysOfWeek.includes(
											opt.value
										) }
										onChange={ ( checked ) =>
											toggleWeekday( opt.value, checked )
										}
									/>
								) ) }
							</div>
						</BaseControl>

						{ /* Daily window */ }
						<ToggleControl
							label={ __( 'Limit to a daily window', 'notibar' ) }
							help={ __(
								'Show the bar only between these times each day. Wraps midnight if end < start (e.g. 22:00 – 02:00).',
								'notibar'
							) }
							checked={ !! dailyWindow.enabled }
							onChange={ ( v ) =>
								set( 'schedule.dailyWindow.enabled', v )
							}
						/>

						{ dailyWindow.enabled && (
							<div className="njt-notibar-schedule__window">
								<BaseControl
									label={ __( 'Start time', 'notibar' ) }
									id="njt-schedule-window-start"
								>
									<input
										id="njt-schedule-window-start"
										type="time"
										className="njt-notibar-time-input"
										value={ dailyWindow.start || '' }
										onChange={ ( e ) =>
											set(
												'schedule.dailyWindow.start',
												e.target.value
											)
										}
									/>
								</BaseControl>
								<BaseControl
									label={ __( 'End time', 'notibar' ) }
									id="njt-schedule-window-end"
								>
									<input
										id="njt-schedule-window-end"
										type="time"
										className="njt-notibar-time-input"
										value={ dailyWindow.end || '' }
										onChange={ ( e ) =>
											set(
												'schedule.dailyWindow.end',
												e.target.value
											)
										}
									/>
								</BaseControl>
							</div>
						) }
					</div>
				) }
			</div>

			{ /* Display trigger (Pro) ----------------------------------- */ }
			<div className="njt-notibar-trigger">
				{ ! pro && (
					<ProUpgradeNotice
						feature={ __( 'Display trigger', 'notibar' ) }
					/>
				) }
				<SelectControl
					label={ __( 'Trigger', 'notibar' ) }
					help={ __(
						'Show the bar after a visitor action, once display conditions are met.',
						'notibar'
					) }
					value={ trigger.type || 'none' }
					options={ TRIGGER_OPTIONS }
					disabled={ ! pro }
					onChange={ ( type ) =>
						set( 'behavior.trigger', {
							type,
							value: TRIGGER_DEFAULTS[ type ],
						} )
					}
				/>
				{ trigger.type !== 'none' && triggerMeta && (
					<BaseControl
						label={ triggerMeta.label }
						id="njt-trigger-value"
					>
						<input
							id="njt-trigger-value"
							type="number"
							className="njt-notibar-number-input"
							value={ trigger.value }
							min={ triggerMeta.min }
							max={ triggerMeta.max }
							step={ 1 }
							disabled={ ! pro }
							onChange={ ( e ) =>
								set( 'behavior.trigger', {
									type: trigger.type,
									value: Math.max(
										triggerMeta.min,
										Math.min(
											triggerMeta.max,
											parseInt( e.target.value, 10 ) || 0
										)
									),
								} )
							}
						/>
					</BaseControl>
				) }
			</div>
		</div>
	);
}
