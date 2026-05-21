/**
 * App — root component for the Notibar Customizer SPA.
 *
 * Two-mode navigation (list / edit):
 *   list  → Display Settings + Bars list (default view)
 *   edit  → Back button + selected bar editor (tabs)
 *
 * Modeled on WP Customizer's section drill-down — click a bar (or Add)
 * pushes you into the editor; the back button returns to the list.
 *
 * State managed by useBars() / useGlobal() hooks; debounce-write back to
 * wp.customize and listen for external changes (undo/revert).
 */
import { useState, useCallback, useEffect } from '@wordpress/element';
import { Panel, PanelBody, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useBars, useGlobal } from './store/use-customizer-state';
import { BarList } from './components/BarList';
import { GlobalSettingsPane } from './components/GlobalSettingsPane';
import { BarEditor } from './components/BarEditor';
import { EmptyState } from './components/EmptyState';
import { createNextBar } from './utils/create-bar';

// Custom Customizer messenger event read by src/customizer-preview/index.js.
// Tells the preview iframe to lock onto a specific bar (no rotation,
// no display-logic filter) while the admin edits it. Payload: { barId }.
const PREVIEW_FOCUS_EVENT = 'notibar-preview-focus';

function sendPreviewFocus( barId ) {
	const wp = window.wp;
	if ( ! wp || ! wp.customize || ! wp.customize.previewer ) {
		return;
	}
	wp.customize.previewer.send( PREVIEW_FOCUS_EVENT, { barId } );
}

function replaceBar( bars, updated ) {
	return bars.map( ( b ) => ( b.id === updated.id ? updated : b ) );
}

// Inline SVG back-arrow icon — matches the wp-components Button icon slot.
const backIcon = (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		width="20"
		height="20"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M14.6 7l-1.4-1.4L6.8 12l6.4 6.4 1.4-1.4-5-5z" />
	</svg>
);

export function App() {
	const [ bars, setBars ] = useBars();
	const [ global, setGlobal ] = useGlobal();

	const [ selectedId, setSelectedId ] = useState( null );
	const [ mode, setMode ] = useState( 'list' );

	const selected = bars.find( ( b ) => b.id === selectedId ) ?? null;

	const handleBarChange = useCallback(
		( updated ) => setBars( ( prev ) => replaceBar( prev, updated ) ),
		[ setBars ]
	);

	const handleSelect = useCallback( ( id ) => {
		setSelectedId( id );
		setMode( 'edit' );
	}, [] );

	const handleBack = useCallback( () => {
		setMode( 'list' );
	}, [] );

	const handleAdd = useCallback( () => {
		setBars( ( prev ) => {
			const bar = createNextBar( prev );
			setSelectedId( bar.id );
			setMode( 'edit' );
			return [ ...prev, bar ];
		} );
	}, [ setBars ] );

	// Tell the preview iframe which bar (if any) is being edited so it
	// pins to that bar and pauses rotation. Cleared when leaving edit mode.
	useEffect( () => {
		if ( mode === 'edit' && selectedId ) {
			sendPreviewFocus( selectedId );
		} else {
			sendPreviewFocus( null );
		}
	}, [ mode, selectedId ] );

	// Listen for the preview iframe's "Edit" button click — the admin
	// pressed Edit on the visible bar; drill into its editor.
	useEffect( () => {
		const wp = window.wp;
		if (
			! wp ||
			! wp.customize ||
			! wp.customize.previewer ||
			typeof wp.customize.previewer.bind !== 'function'
		) {
			return undefined;
		}
		function onEditBar( data ) {
			const id =
				data && typeof data.barId === 'string' ? data.barId : null;
			if ( ! id ) {
				return;
			}
			// Expand the Customizer section that hosts the SPA — without
			// this, an admin sitting on the root Customizer panel (or on a
			// different section like Site Identity) sees no visible change
			// when clicking Edit, because the SPA is hidden inside a
			// collapsed section. focus() opens AND scrolls it into view.
			if ( wp.customize.section ) {
				const section = wp.customize.section( 'njt_nofi_bars_section' );
				if ( section && typeof section.focus === 'function' ) {
					section.focus();
				}
			}
			// Drill the SPA into the bar editor for this bar.
			handleSelect( id );
		}
		wp.customize.previewer.bind( 'notibar-edit-bar', onEditBar );
		// previewer.unbind isn't on the public API in older WP — App mounts
		// once per session so the leak is bounded and self-clearing.
		return undefined;
	}, [ handleSelect, bars ] );

	const isEditing = mode === 'edit' && selected;
	const selectedName =
		selected && selected.name
			? selected.name
			: __( 'Untitled bar', 'notibar' );

	if ( isEditing ) {
		return (
			<div className="njt-notibar-app njt-notibar-app--editing">
				<div className="njt-notibar-editor-header">
					<Button
						icon={ backIcon }
						onClick={ handleBack }
						label={ __( 'Back to bars', 'notibar' ) }
						className="njt-notibar-editor-header__back"
					/>
					<span
						className="njt-notibar-editor-header__title"
						title={ selectedName }
					>
						{ selectedName }
					</span>
				</div>

				<div className="njt-notibar-editor-body">
					<BarEditor bar={ selected } onChange={ handleBarChange } />
				</div>
			</div>
		);
	}

	return (
		<div className="njt-notibar-app">
			<Panel className="njt-notibar-app__panel">
				<PanelBody
					title={ __( 'Display Settings', 'notibar' ) }
					initialOpen={ false }
				>
					<GlobalSettingsPane
						value={ global }
						onChange={ setGlobal }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Bars', 'notibar' ) }
					initialOpen={ true }
				>
					{ bars.length === 0 ? (
						<EmptyState onAdd={ handleAdd } />
					) : (
						<BarList
							bars={ bars }
							selectedId={ selectedId }
							onSelect={ handleSelect }
							onChange={ setBars }
						/>
					) }
				</PanelBody>
			</Panel>
		</div>
	);
}
