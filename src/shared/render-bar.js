/**
 * Notibar shared render module.
 *
 * Pure function: bar + global config → HTML string.
 * No DOM mutations, no global reads, no side-effects.
 *
 * MARKUP CONTRACT: The structure produced here is the authoritative v3 markup.
 * Phase 07 frontend JS and PHP SSR MUST emit identical class names, data
 * attributes, and CSS custom properties. Do not change structure without
 * updating phase 07 simultaneously.
 *
 * Escape policy:
 *  - bar.content.text / bar.content.textMobile → safe innerHTML (wp_kses_post on server).
 *  - Everything else (button text, URL, color values, IDs…) → escapeAttr / escapeText.
 *
 * @since 3.0.0
 */

import { escapeAttr, escapeText, decodeBasicEntities } from './escape-utils.js';

// Content layouts. Arrangement is driven entirely by CSS keyed on the
// data-layout attribute (see notibar.css); the renderer only validates the
// value and emits it. Unknown/missing → 'centered'. MIRROR: Schema::ALLOWED_LAYOUT.
const ALLOWED_LAYOUTS = [
	'centered',
	'text-left',
	'three-zone',
	'hero',
	'split',
	'content-left',
	'content-right',
];

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Render a CTA button anchor element.
 *
 * @param {Object} button Button config from bar.content.
 * @param {Object} style  Bar style config (for btnBgColor, btnTextColor, fontWeight).
 * @param {string} kind   'desktop' | 'mobile' — affects aria-label suffix.
 *
 * @return {string} HTML string or empty string when button disabled.
 */
function renderButton( button, style, kind ) {
	if ( ! button || ! button.enabled ) {
		return '';
	}

	// action: 'close' dismisses the bar; anything else (default 'link') opens a
	// URL. Missing action stays a link, keeping pre-action data unchanged.
	const isClose = button.action === 'close';

	// Decode any pre-existing HTML entities in the stored text before the
	// render layer re-escapes them. Defensive against legacy v2.x data
	// migrated via wp_filter_nohtml_kses, which stored "&" as "&amp;".
	const text = decodeBasicEntities( button.text || 'Learn more' );
	const ariaLabel = text.trim()
		? escapeAttr( text )
		: `Learn more about this notification (${ kind })`;

	// btnBgColor is a validated hex on save (3/6/8-digit; the 8-digit form carries
	// an alpha channel from the alpha-enabled picker). escapeAttr is a second belt
	// before it lands in the style attribute. border-radius lives in CSS (6px);
	// only the dynamic, user-configurable bits are inline here.
	const btnBgRaw = style.btnBgColor || '#1919cf';
	const btnBg = escapeAttr( btnBgRaw );
	// The :focus-visible ring (--njt-btn-bg) uses a SOLID colour: drop the alpha
	// byte of an 8-digit hex so the outline stays fully visible even when the
	// button fill is semi-transparent.
	const btnBgSolid = escapeAttr(
		/^#[0-9a-fA-F]{8}$/.test( btnBgRaw ) ? btnBgRaw.slice( 0, 7 ) : btnBgRaw
	);
	const btnStyle = [
		`background:${ btnBg }`,
		`--njt-btn-bg:${ btnBgSolid }`,
		`color:${ escapeAttr( style.btnTextColor || '#ffffff' ) }`,
		`font-weight:${ escapeAttr( button.fontWeight || 500 ) }`,
	].join( ';' );

	// Pro CTA animations: append the attention/hover classes (token == schema
	// enum == CSS class suffix). animClasses is declared outside the Pro-only
	// block below so the Lite build (which strips that block) keeps the empty
	// default — no classes, no animation. Tokens are whitelisted, so direct
	// interpolation is safe.
	let animClasses = '';
	/* @pro */
	const ATTN = [
		'wobble',
		'shake',
		'bounce',
		'pulse',
		'swing',
		'jello',
		'tada',
		'rubber-band',
		'heartbeat',
		'flash',
		'blink',
		'vibrate',
		'pop',
		'bounce-in',
	];
	const HOV = [
		'grow',
		'shrink',
		'lift',
		'glow',
		'press',
		'shadow',
		'color-shift',
		'slide-fill',
	];
	const animParts = [];
	if ( button.attention && ATTN.includes( button.attention ) ) {
		animParts.push( `njt-nofi-anim-${ button.attention }` );
	}
	if ( button.hover && HOV.includes( button.hover ) ) {
		animParts.push( `njt-nofi-hover-${ button.hover }` );
	}
	animClasses = animParts.length ? ' ' + animParts.join( ' ' ) : '';
	/* @endpro */

	// Close action: a real <button> (no href/target) carrying data-njt-action
	// so the frontend + preview click delegates dismiss the bar. Shares the
	// .njt-nofi-button-text class + inline style for identical appearance.
	if ( isClose ) {
		// data-njt-reopen carries this button's own reopen-after-days so the
		// dismissal cookie TTL is independent of the × control's behavior value.
		const reopenDays = Math.max(
			0,
			Math.min( 365, Number( button.reopenAfterDays ) || 0 )
		);
		return (
			`<div class="njt-nofi-button">` +
			`<button type="button" data-njt-action="close" ` +
			`data-njt-reopen="${ reopenDays }" ` +
			`class="njt-nofi-button-text${ animClasses }" ` +
			`aria-label="${ ariaLabel }" ` +
			`style="${ btnStyle }">` +
			escapeText( text ) +
			`</button></div>`
		);
	}

	const url = button.url || '#';
	const newWindow = button.newWindow
		? ' target="_blank" rel="noopener noreferrer"'
		: '';

	return (
		`<div class="njt-nofi-button">` +
		`<a href="${ escapeAttr( url ) }"${ newWindow } ` +
		`class="njt-nofi-button-text${ animClasses }" ` +
		`aria-label="${ ariaLabel }" ` +
		`style="${ btnStyle }">` +
		escapeText( text ) +
		`</a></div>`
	);
}

/**
 * Render the dismissal / toggle control.
 * hideCloseButton: 'close' | 'toggle' | 'disable'
 *
 * @param {string} mode hideCloseButton enum value.
 *
 * @return {string} HTML string or empty string for 'disable'.
 */
function renderCloseControl( mode ) {
	// SVG × path used for both close and toggle icons.
	const svgPath =
		'm386.667 45.564-45.564-45.564-147.77 147.769-147.769-147.769' +
		'-45.564 45.564 147.769 147.769-147.769 147.77 45.564 45.564' +
		' 147.769-147.769 147.769 147.769 45.564-45.564-147.768-147.77z';

	const svgIcon =
		`<svg class="njt-nofi-close-icon" xmlns="http://www.w3.org/2000/svg" ` +
		`viewBox="0 0 386.667 386.667" width="14" height="14" aria-hidden="true">` +
		`<path d="${ svgPath }" fill="currentColor"/></svg>`;

	if ( mode === 'close' ) {
		return (
			`<button class="njt-nofi-close" type="button" aria-label="Close">` +
			svgIcon +
			`</button>`
		);
	}

	if ( mode === 'toggle' ) {
		return (
			`<button class="njt-nofi-toggle" type="button" aria-label="Collapse/expand">` +
			svgIcon +
			`</button>`
		);
	}

	// 'disable' — no control rendered.
	return '';
}

/* @pro */
// Countdown unit display labels. Plain strings (this shared render module is
// vanilla, no i18n — matches the rest of render-bar.js). Whitelisted keys.
const CD_UNIT_LABELS = {
	days: 'Days',
	hours: 'Hours',
	minutes: 'Minutes',
	seconds: 'Seconds',
};

// Compact but readable labels for the inline 'text' style (e.g. "2 days 3 hrs").
const CD_UNIT_LABELS_TEXT = {
	days: 'days',
	hours: 'hrs',
	minutes: 'mins',
	seconds: 'secs',
};

/**
 * Render a countdown timer block (Pro). Emits a static, pre-painted shell that
 * the countdown.js ticker hydrates client-side. Returns '' when disabled or
 * when there is nothing to count to (date with no resolved epoch / evergreen
 * with no duration).
 *
 * Markup contract (consumed by countdown.js + notibar.css):
 *   .njt-nofi-countdown.njt-nofi-countdown--{ui}[data-cd-type|end|duration|units]
 *     > .njt-nofi-cd-unit[data-cd-unit] > (ring?) + .njt-nofi-cd-num + .njt-nofi-cd-label
 *
 * @param {Object} countdown bar.countdown config (may carry server-resolved endEpoch).
 * @param {Object} [i18n]    Localized labels from PHP (cdUnits/cdUnitsShort/cdAria);
 *                           falls back to English when absent.
 * @return {string} HTML string or '' when nothing to render.
 */
function renderCountdown( countdown, i18n ) {
	if ( ! countdown || ! countdown.enabled ) {
		return '';
	}

	const type = countdown.type === 'evergreen' ? 'evergreen' : 'date';
	// endEpoch (ms) is injected server-side for type=date; duration is seconds.
	const endEpoch = Number( countdown.endEpoch ) || 0;
	const duration = Math.max( 0, Number( countdown.duration ) || 0 );

	// Nothing to count to → render nothing (avoids a frozen "--" shell).
	if (
		( type === 'date' && ! endEpoch ) ||
		( type === 'evergreen' && ! duration )
	) {
		return '';
	}

	const ui = [ 'boxes', 'flip', 'circular', 'text' ].includes( countdown.ui )
		? countdown.ui
		: 'boxes';

	// Localized labels from PHP (njtNotibarData.i18n) with English fallback.
	// 'text' uses compact labels (2 days 3 hrs …); others use full words.
	const fullLabels = ( i18n && i18n.cdUnits ) || CD_UNIT_LABELS;
	const shortLabels = ( i18n && i18n.cdUnitsShort ) || CD_UNIT_LABELS_TEXT;
	const labels = ui === 'text' ? shortLabels : fullLabels;

	const allUnits = [ 'days', 'hours', 'minutes', 'seconds' ];
	const picked = Array.isArray( countdown.units )
		? allUnits.filter( ( u ) => countdown.units.includes( u ) )
		: [];
	const units = picked.length ? picked : allUnits;

	const cells = units
		.map( ( u ) => {
			const ring =
				ui === 'circular'
					? `<svg class="njt-nofi-cd-ring" viewBox="0 0 36 36" aria-hidden="true">` +
					  `<circle class="njt-nofi-cd-ring-track" cx="18" cy="18" r="16" fill="none"/>` +
					  `<circle class="njt-nofi-cd-ring-fill" cx="18" cy="18" r="16" fill="none"/>` +
					  `</svg>`
					: '';
			return (
				`<span class="njt-nofi-cd-unit" data-cd-unit="${ u }">` +
				ring +
				`<span class="njt-nofi-cd-num" aria-hidden="true">--</span>` +
				`<span class="njt-nofi-cd-label">${ escapeText(
					labels[ u ]
				) }</span>` +
				`</span>`
			);
		} )
		.join( '' );

	return (
		`<div class="njt-nofi-countdown njt-nofi-countdown--${ ui }" ` +
		`data-cd-type="${ type }" ` +
		`data-cd-end="${ endEpoch || '' }" ` +
		`data-cd-duration="${ duration }" ` +
		`data-cd-token="${ escapeAttr(
			Number( countdown.resetToken ) || 0
		) }" ` +
		`data-cd-showall="${ countdown.showAllUnits ? '1' : '' }" ` +
		`data-cd-units="${ escapeAttr( units.join( ',' ) ) }" ` +
		`aria-label="${ escapeAttr(
			( i18n && i18n.cdAria ) || 'Countdown timer'
		) }">` +
		cells +
		`</div>`
	);
}
/* @endpro */

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Render a notification bar to an HTML string.
 *
 * Resilient mobile rendering (resolved decision #3): both desktop AND mobile
 * content blocks are always emitted. CSS media query reveals one at runtime.
 * JS never makes a device choice based on window.innerWidth.
 *
 * The `global` parameter is accepted for API consistency with phase 07 usage
 * (e.g. rotation caller passes global through). Currently unused here since
 * bar-level style is self-contained, but retained for forward compatibility.
 *
 * @param {Object} bar    Bar object conforming to Schema::defaultBar() shape.
 * @param {Object} global Global config conforming to Schema::defaultGlobal() shape.
 *
 * @return {string} Complete bar HTML string.
 */
// eslint-disable-next-line no-unused-vars -- global is part of the API contract (phase 07 callers pass it through rotation)
export function renderBarHTML( bar, global ) {
	const style = bar.style || {};
	const content = bar.content || {};
	const behavior = bar.behavior || {};

	const bgColor = escapeAttr( style.bgColor || '#9af4cf' );
	const textColor = escapeAttr( style.textColor || '#1919cf' );
	const fontSize = escapeAttr( Number( style.fontSize ) || 15 );
	const contentWidth = escapeAttr( Number( style.contentWidth ) || 900 );
	const positionType = escapeAttr( style.positionType || 'fixed' );
	// Pro: top/bottom placement. Lite forces 'top' (the assignment is stripped)
	// so a bar saved as 'bottom' under Pro never renders at the bottom in Lite.
	let placement = 'top';
	/* @pro */
	placement = style.placement === 'bottom' ? 'bottom' : 'top';
	/* @endpro */
	const layout = ALLOWED_LAYOUTS.includes( style.layout )
		? style.layout
		: 'centered';
	const barId = escapeAttr( bar.id || '' );

	// Overall bar opacity (percent → 0–1). Applied to the un-animated
	// .njt-nofi-container layer so it does not fight the entrance opacity
	// animations on .njt-nofi-container-content and the bar itself. Clamped
	// 10–100; only emitted when < 100 to keep markup clean for opaque bars.
	const opacityPct = Math.min(
		100,
		Math.max( 10, Number( style.opacity ) || 100 )
	);
	const containerOpacityAttr =
		opacityPct < 100 ? ` style="opacity:${ opacityPct / 100 }"` : '';

	// Countdown timer (Pro). Computed once; emitted into both content blocks
	// (one visible per viewport). Declared empty so the Lite build — which
	// strips the assignment below — renders no countdown at all.
	let countdownHTML = '';
	/* @pro */
	countdownHTML = renderCountdown( bar.countdown, global && global.i18n );
	/* @endpro */

	// Desktop content block — always emitted. Arrangement comes from CSS keyed
	// on data-layout; only max-width and font-size stay inline.
	const desktopBlock =
		`<div class="njt-nofi-content njt-nofi-content-desktop" ` +
		`data-layout="${ escapeAttr( layout ) }" ` +
		`style="max-width:${ contentWidth }px;font-size:${ fontSize }px;">` +
		`<div class="njt-nofi-text">${ content.text || '' }</div>` +
		countdownHTML +
		renderButton( content.button, style, 'desktop' ) +
		`</div>`;

	// Mobile content block — only emitted when mobileSeparate is true.
	// When false, CSS media query simply continues showing the desktop block.
	// Text and button are both device-specific in this branch; falls back to
	// the desktop button only if buttonMobile is somehow missing (defensive —
	// Schema::defaultContent populates both by default).
	const mobileBlock = content.mobileSeparate
		? `<div class="njt-nofi-content njt-nofi-content-mobile" ` +
		  `data-layout="${ escapeAttr( layout ) }" ` +
		  `style="font-size:${ fontSize }px;">` +
		  `<div class="njt-nofi-text">${ content.textMobile || '' }</div>` +
		  countdownHTML +
		  renderButton(
				content.buttonMobile || content.button,
				style,
				'mobile'
		  ) +
		  `</div>`
		: '';

	const closeControl = renderCloseControl(
		behavior.hideCloseButton || 'close'
	);

	// Marker class — present only when a mobile block was emitted. CSS uses
	// this to decide whether to hide the desktop block on mobile; without it,
	// the desktop block must stay visible (otherwise the bar is blank when
	// content.mobileSeparate is false).
	const barClass =
		'njt-nofi-notification-bar' +
		( content.mobileSeparate ? ' njt-nofi-has-mobile' : '' );

	return (
		`<div class="njt-nofi-container-content" role="status" aria-live="polite" data-bar-id="${ barId }">` +
		`<div class="njt-nofi-container" data-position="${ positionType }" data-placement="${ placement }"${ containerOpacityAttr }>` +
		`<div class="${ barClass }" ` +
		`style="--njt-bar-bg:${ bgColor };--njt-bar-color:${ textColor };">` +
		desktopBlock +
		mobileBlock +
		closeControl +
		`</div>` +
		`</div>` +
		`</div>`
	);
}
