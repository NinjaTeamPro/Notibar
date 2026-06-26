/**
 * LayoutPicker — visual picker for the bar content layout (style.layout).
 *
 * Renders a radio grid of 5 thumbnail SVGs, one per layout, mirroring how the
 * frontend arranges the text → countdown → button row. Replaces the former
 * Alignment ButtonGroup. Values mirror Schema::ALLOWED_LAYOUT and the
 * [data-layout] CSS rules in notibar.css.
 */
import { __ } from '@wordpress/i18n';

// --- Thumbnail primitives (shared geometry across the 5 layouts) ----------
// Neutral palette so thumbnails read as a wireframe, not the live bar colours.
const TEXT = '#3f3f46';
const SUB = '#c4c4c8';
const CELL = '#a1a1aa';
const BTN = '#18181b';

// A short text block (title + subtitle lines) anchored at x.
const TextBlock = ( { x, w = 26 } ) => (
	<>
		<rect
			x={ x }
			y={ 9 }
			width={ w }
			height={ 3.5 }
			rx={ 1.75 }
			fill={ TEXT }
		/>
		<rect
			x={ x }
			y={ 16 }
			width={ w * 0.7 }
			height={ 3.5 }
			rx={ 1.75 }
			fill={ SUB }
		/>
	</>
);

// Three small timer cells starting at x.
const Timer = ( { x, size = 8, y = 8 } ) => (
	<g fill={ CELL }>
		<rect x={ x } y={ y } width={ size } height={ size } rx={ 1.5 } />
		<rect
			x={ x + size + 3 }
			y={ y }
			width={ size }
			height={ size }
			rx={ 1.5 }
		/>
		<rect
			x={ x + ( size + 3 ) * 2 }
			y={ y }
			width={ size }
			height={ size }
			rx={ 1.5 }
		/>
	</g>
);

// A pill button anchored at x.
const Btn = ( { x, w = 22, y = 9 } ) => (
	<rect x={ x } y={ y } width={ w } height={ 11 } rx={ 3 } fill={ BTN } />
);

// Each layout's thumbnail. viewBox 120×28 (hero is 120×46 for the stack).
function Thumb( { layout } ) {
	const box = ( h, children ) => (
		<svg
			viewBox={ `0 0 120 ${ h }` }
			width="100%"
			height="100%"
			role="presentation"
			focusable="false"
		>
			<rect width={ 120 } height={ h } rx={ 4 } fill="#e6e6e9" />
			{ children }
		</svg>
	);

	switch ( layout ) {
		case 'text-left':
			// Text left · timer + button clustered right.
			return box(
				28,
				<>
					<TextBlock x={ 8 } />
					<Timer x={ 56 } />
					<Btn x={ 92 } />
				</>
			);
		case 'three-zone':
			// Text left · timer centre · button right.
			return box(
				28,
				<>
					<TextBlock x={ 8 } w={ 22 } />
					<Timer x={ 45 } />
					<Btn x={ 92 } />
				</>
			);
		case 'split':
			// Text + timer left · button right.
			return box(
				28,
				<>
					<TextBlock x={ 8 } w={ 22 } />
					<Timer x={ 38 } />
					<Btn x={ 92 } />
				</>
			);
		case 'hero':
			// Vertical stack, centred, larger timer.
			return box(
				46,
				<>
					<rect
						x={ 40 }
						y={ 6 }
						width={ 40 }
						height={ 3.5 }
						rx={ 1.75 }
						fill={ TEXT }
					/>
					<Timer x={ 42 } size={ 10 } y={ 14 } />
					<Btn x={ 47 } w={ 26 } y={ 30 } />
				</>
			);
		case 'content-left':
			// Whole group clustered at the left.
			return box(
				28,
				<>
					<TextBlock x={ 8 } w={ 18 } />
					<Timer x={ 32 } />
					<Btn x={ 66 } />
				</>
			);
		case 'content-right':
			// Whole group clustered at the right.
			return box(
				28,
				<>
					<TextBlock x={ 34 } w={ 18 } />
					<Timer x={ 58 } />
					<Btn x={ 92 } />
				</>
			);
		case 'centered':
		default:
			// Whole group centred.
			return box(
				28,
				<>
					<TextBlock x={ 18 } w={ 22 } />
					<Timer x={ 50 } />
					<Btn x={ 84 } />
				</>
			);
	}
}

const LAYOUT_OPTIONS = [
	{ value: 'centered', label: __( 'Centered', 'notibar' ) },
	{ value: 'text-left', label: __( 'Text left', 'notibar' ) },
	{ value: 'three-zone', label: __( 'Three zones', 'notibar' ) },
	{ value: 'hero', label: __( 'Hero', 'notibar' ) },
	{ value: 'split', label: __( 'Split', 'notibar' ) },
	{ value: 'content-left', label: __( 'All left', 'notibar' ) },
	{ value: 'content-right', label: __( 'All right', 'notibar' ) },
];

/**
 * @param {Object}   props
 * @param {string}   props.value    Current layout value.
 * @param {Function} props.onChange Called with the chosen layout value.
 */
export function LayoutPicker( { value, onChange } ) {
	const current = LAYOUT_OPTIONS.some( ( o ) => o.value === value )
		? value
		: 'centered';

	return (
		<div className="njt-notibar-layout-picker">
			<span className="njt-notibar-layout-picker__label">
				{ __( 'Layout', 'notibar' ) }
			</span>
			<div
				className="njt-notibar-layout-picker__grid"
				role="radiogroup"
				aria-label={ __( 'Content layout', 'notibar' ) }
			>
				{ LAYOUT_OPTIONS.map( ( opt ) => {
					const selected = current === opt.value;
					return (
						<button
							key={ opt.value }
							type="button"
							role="radio"
							aria-checked={ selected }
							className={
								'njt-notibar-layout-picker__option' +
								( selected ? ' is-selected' : '' )
							}
							onClick={ () => onChange( opt.value ) }
						>
							<span className="njt-notibar-layout-picker__thumb">
								<Thumb layout={ opt.value } />
							</span>
							<span className="njt-notibar-layout-picker__caption">
								{ opt.label }
							</span>
						</button>
					);
				} ) }
			</div>
		</div>
	);
}
