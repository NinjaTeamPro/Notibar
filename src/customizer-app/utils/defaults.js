/**
 * JS defaults mirroring Schema.php — keep in sync manually.
 *
 * MIRROR: includes/NotificationBar/Schema.php — keep in sync.
 *
 * When Schema::defaultBar() or Schema::defaultGlobal() change,
 * update this file to match. Phase-10 QA includes a manual diff check.
 *
 * ID is NOT included in DEFAULT_BAR; newBar() assigns a fresh uuid v4.
 *
 * Note: store/defaults.js re-exports from here for backward compat.
 */
import { uuidv4 } from './uuid';

// ------------------------------------------------------------------
// Default button (nested inside bar content)
// ------------------------------------------------------------------
const DEFAULT_BUTTON = {
	enabled: true,
	text: 'Learn more',
	url: '',
	fontWeight: 500,
	newWindow: true,
	// 'link' opens the URL; 'close' dismisses the bar. MIRROR: Schema::defaultButton().
	action: 'link',
};

// ------------------------------------------------------------------
// Default bar (no id — newBar() assigns one)
// ------------------------------------------------------------------
export const DEFAULT_BAR = {
	name: 'My notification bar',
	enabled: true,
	order: 0,
	content: {
		text: 'This is default text for notification bar',
		textMobile: 'This is default text for notification bar',
		mobileSeparate: false,
		button: { ...DEFAULT_BUTTON },
		buttonMobile: { ...DEFAULT_BUTTON },
	},
	style: {
		bgColor: '#9af4cf',
		textColor: '#1919cf',
		btnBgColor: '#1919cf',
		btnTextColor: '#ffffff',
		fontSize: 15,
		layout: 'centered',
		contentWidth: 900,
		positionType: 'fixed',
		placement: 'top',
		// Overall bar opacity, percent (10–100). Fades the whole bar (bg + text +
		// button) via CSS opacity on the un-animated container. MIRROR: Schema.php.
		opacity: 100,
		// Snapshot of the last-applied colour preset, or null. Drives the
		// "reset to preset" behaviour of the per-colour Reset buttons.
		// Shape: { bg, text, btnBg, btnText, name? }. Mirrors Schema.php.
		activePreset: null,
	},
	display: {
		devices: [ 'desktop', 'mobile' ],
		pageLogic: 'all',
		pageIds: [],
		postLogic: 'all',
		postIds: [],
		cptTypes: [],
		cptLogic: 'all',
		cptIds: [],
		audience: 'all',
		roles: [],
		userIds: [],
		// Country targeting (Pro). countryLogic: all|include|exclude.
		// countries: ISO 3166-1 alpha-2 codes. Default = no restriction.
		countryLogic: 'all',
		countries: [],
	},
	behavior: {
		hideCloseButton: 'close',
		reopenAfterDays: 1,
		// Display trigger (Pro). Defers reveal until a runtime condition fires.
		// value per type: scroll=% (1–100), time=seconds (0–3600), click=count
		// (1–100); none ignores value. MIRROR: Schema.php behavior.trigger.
		trigger: { type: 'none', value: 0 },
	},
	schedule: {
		// Master toggle — schedule is fully inert until enabled.
		enabled: false,
		// When true: skip PHP gate, evaluate all four fields below against
		// the visitor's browser-local clock instead of the WP site TZ.
		useClientTime: false,
		// Date range; "YYYY-MM-DDTHH:MM" datetime-local strings.
		// Evaluated in site TZ unless useClientTime = true.
		// Empty string = unbounded on that side.
		startAt: '',
		endAt: '',
		// Daily window — independent toggle. "HH:MM" 24h.
		dailyWindow: {
			enabled: false,
			start: '',
			end: '',
		},
		// Day-of-week filter: 0=Sun .. 6=Sat. All days enabled by default.
		daysOfWeek: [ 0, 1, 2, 3, 4, 5, 6 ],
	},
	// Countdown timer (Pro). Disabled by default; render + ticker are Pro-only.
	// type: 'date' counts to a fixed instant (endAt, resolved server-side to an
	// absolute epoch in site TZ); 'evergreen' counts down a per-visitor duration
	// window persisted client-side. ui: boxes|flip|circular. units: which time
	// units to show. MIRROR: Schema.php defaultCountdown().
	countdown: {
		enabled: false,
		type: 'date',
		endAt: '',
		duration: 0,
		ui: 'boxes',
		units: [ 'days', 'hours', 'minutes', 'seconds' ],
		// When false (default), leading zero units are hidden at display time;
		// when true, all selected units always show. MIRROR: Schema.php.
		showAllUnits: false,
		// Bumped by the "Reset visitors' timers" action to re-seed evergreen
		// windows for returning visitors. MIRROR: Schema.php defaultCountdown().
		resetToken: 0,
	},
};

// ------------------------------------------------------------------
// Default global config
// ------------------------------------------------------------------
export const DEFAULT_GLOBAL = {
	displayMode: 'single',
	rotationIntervalSeconds: 5,
	rotationPauseOnHover: true,
	rotationOrder: 'sequential',
	rotationShowArrows: true,
	stackPositionType: 'fixed',
};

// ------------------------------------------------------------------
// Factory
// ------------------------------------------------------------------

/**
 * Create a new bar object with a fresh uuid v4 id.
 * Always merges from window.njtNotibarBoot.defaultBar when available,
 * so the server-emitted schema stays authoritative.
 *
 * @param {Object} overrides Shallow overrides applied on top of defaults.
 * @return {Object} New bar object with a unique uuid v4 id.
 */
export function newBar( overrides = {} ) {
	const bootDefault =
		window.njtNotibarBoot && window.njtNotibarBoot.defaultBar
			? window.njtNotibarBoot.defaultBar
			: DEFAULT_BAR;

	// Deep clone via JSON to prevent shared reference mutations.
	const base = JSON.parse( JSON.stringify( bootDefault ) );

	return {
		...base,
		...overrides,
		id: uuidv4(),
	};
}
