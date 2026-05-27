/**
 * ExportImportTab — full Export + Import UI for the Settings page.
 *
 * Three cards in document order:
 *   1. Export        — 3 checkboxes + Download
 *   2. Backup hint   — "Download current configuration before importing"
 *   3. Import        — file pick → preview → confirm modal → Replace
 *
 * Round-trip:
 *   GET  /notibar/v1/export?include=<csv>
 *   POST /notibar/v1/import  { _notibar_export_version, _exported_at, bars?, global?, tracking? }
 *
 * Auth: REST nonce via apiFetch middleware (Phase 02 boot).
 */
import { useState } from '@wordpress/element';
import { Button, CheckboxControl, Modal, Notice } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { __, sprintf } from '@wordpress/i18n';

const MAX_IMPORT_BYTES = 10485760;
const EXPORT_VERSION = 1;
const SECTIONS = [
	'bars',
	'global',
	/* @pro */
	'tracking',
	/* @endpro */
];

const SECTION_LABELS = {
	bars: __( 'Bars', 'notibar' ),
	global: __( 'Global settings', 'notibar' ),
	/* @pro */
	tracking: __( 'Tracking counters', 'notibar' ),
	/* @endpro */
};

function todayIso() {
	return new Date().toISOString().slice( 0, 10 );
}

function buildFilename( siteHost ) {
	const host = siteHost && String( siteHost ).length > 0 ? siteHost : 'site';
	return `notibar-export-${ host }-${ todayIso() }.json`;
}

function sectionCountsFromParsed( parsed ) {
	const counts = {};
	if ( Array.isArray( parsed.bars ) ) {
		counts.bars = parsed.bars.length;
	}
	if ( parsed.global && typeof parsed.global === 'object' ) {
		counts.global = 1;
	}
	/* @pro */
	if ( parsed.tracking && typeof parsed.tracking === 'object' ) {
		counts.tracking = Object.keys( parsed.tracking ).length;
	}
	/* @endpro */
	return counts;
}

async function downloadExport( include, filename ) {
	const query = include.length ? `?include=${ include.join( ',' ) }` : '';
	const res = await apiFetch( {
		path: `/notibar/v1/export${ query }`,
		parse: false,
	} );
	const blob = await res.blob();
	const url = URL.createObjectURL( blob );
	const a = document.createElement( 'a' );
	a.href = url;
	a.download = filename;
	document.body.appendChild( a );
	a.click();
	document.body.removeChild( a );
	URL.revokeObjectURL( url );
}

export function ExportImportTab() {
	const boot = window.njtNotibarSettingsBoot || {};
	const siteHost = boot.siteHost || 'site';

	// Derived from SECTIONS so the Lite strip (which drops 'tracking') stays
	// consistent without a hardcoded key list here.
	const [ exportSel, setExportSel ] = useState( () =>
		Object.fromEntries( SECTIONS.map( ( k ) => [ k, true ] ) )
	);
	const [ exportBusy, setExportBusy ] = useState( false );

	const [ parsed, setParsed ] = useState( null );
	const [ importSel, setImportSel ] = useState( {} );
	const [ importBusy, setImportBusy ] = useState( false );
	const [ confirmOpen, setConfirmOpen ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	const exportAtLeastOne = SECTIONS.some( ( k ) => exportSel[ k ] );

	async function handleExport( sel ) {
		setExportBusy( true );
		setNotice( null );
		try {
			const include = SECTIONS.filter( ( k ) => sel[ k ] );
			await downloadExport( include, buildFilename( siteHost ) );
		} catch ( e ) {
			setNotice( {
				kind: 'error',
				text: __(
					'Export failed. Check the browser console.',
					'notibar'
				),
			} );
		} finally {
			setExportBusy( false );
		}
	}

	function handleFile( e ) {
		setNotice( null );
		const file = e.target.files && e.target.files[ 0 ];
		if ( ! file ) {
			return;
		}
		if ( file.size > MAX_IMPORT_BYTES ) {
			setNotice( {
				kind: 'error',
				text: __( 'File exceeds 10 MB. Refusing to load.', 'notibar' ),
			} );
			setParsed( null );
			return;
		}
		const reader = new window.FileReader();
		reader.onload = () => {
			try {
				const data = JSON.parse( String( reader.result ) );
				const v = Number( data._notibar_export_version );
				if ( ! v || v > EXPORT_VERSION ) {
					throw new Error( 'Unsupported version' );
				}
				setParsed( data );
				setImportSel( {
					bars: Array.isArray( data.bars ),
					global: !! data.global && typeof data.global === 'object',
					/* @pro */
					tracking:
						!! data.tracking && typeof data.tracking === 'object',
					/* @endpro */
				} );
			} catch ( err ) {
				setParsed( null );
				setNotice( {
					kind: 'error',
					text: __(
						'File is not a valid Notibar export.',
						'notibar'
					),
				} );
			}
		};
		reader.readAsText( file );
	}

	async function handleReplace() {
		setImportBusy( true );
		setNotice( null );
		const payload = {
			_notibar_export_version: EXPORT_VERSION,
			_exported_at: parsed._exported_at,
		};
		if ( importSel.bars && Array.isArray( parsed.bars ) ) {
			payload.bars = parsed.bars;
		}
		if ( importSel.global && parsed.global ) {
			payload.global = parsed.global;
		}
		/* @pro */
		if ( importSel.tracking && parsed.tracking ) {
			payload.tracking = parsed.tracking;
		}
		/* @endpro */
		try {
			const res = await apiFetch( {
				path: '/notibar/v1/import',
				method: 'POST',
				data: payload,
			} );
			const r = ( res && res.replaced ) || {};
			setNotice( {
				kind: 'success',
				text: sprintf(
					/* translators: %1$d bars imported, %2$s global yes/no */
					__(
						'Imported %1$d bar(s), global=%2$s. Reload to see changes.',
						'notibar'
					),
					r.bars || 0,
					r.global ? 'yes' : 'no'
				),
			} );
			setConfirmOpen( false );
			setParsed( null );
		} catch ( e ) {
			setNotice( {
				kind: 'error',
				text: ( e && e.message ) || __( 'Import failed.', 'notibar' ),
			} );
			setConfirmOpen( false );
		} finally {
			setImportBusy( false );
		}
	}

	return (
		<div className="njt-notibar-export-import">
			{ notice && (
				<Notice
					status={ notice.kind }
					onRemove={ () => setNotice( null ) }
				>
					{ notice.text }
				</Notice>
			) }

			{ /* Export card */ }
			<section className="njt-notibar-export-import__card">
				<h2>{ __( 'Export', 'notibar' ) }</h2>
				<p>
					{ __(
						'Pick which sections to include, then download the JSON file.',
						'notibar'
					) }
				</p>
				{ SECTIONS.map( ( k ) => (
					<CheckboxControl
						key={ k }
						label={ SECTION_LABELS[ k ] }
						checked={ !! exportSel[ k ] }
						onChange={ ( v ) =>
							setExportSel( { ...exportSel, [ k ]: v } )
						}
					/>
				) ) }
				<Button
					variant="primary"
					disabled={ ! exportAtLeastOne || exportBusy }
					isBusy={ exportBusy }
					onClick={ () => handleExport( exportSel ) }
				>
					{ __( 'Download', 'notibar' ) }
				</Button>
			</section>

			{ /* Backup hint */ }
			<section className="njt-notibar-export-import__card njt-notibar-export-import__backup">
				<p>
					<strong>
						{ __(
							'Tip: download a full backup before importing.',
							'notibar'
						) }
					</strong>
				</p>
				<Button
					variant="secondary"
					disabled={ exportBusy }
					onClick={ () =>
						handleExport(
							Object.fromEntries(
								SECTIONS.map( ( k ) => [ k, true ] )
							)
						)
					}
				>
					{ __( 'Download backup', 'notibar' ) }
				</Button>
			</section>

			{ /* Import card */ }
			<section className="njt-notibar-export-import__card">
				<h2>{ __( 'Import', 'notibar' ) }</h2>
				<p>
					{ __(
						'Imports REPLACE the current data for any selected section. This cannot be undone.',
						'notibar'
					) }
				</p>
				<input
					type="file"
					accept=".json,application/json"
					onChange={ handleFile }
				/>
				{ parsed && (
					<div className="njt-notibar-export-import__preview">
						<p>
							{ sprintf(
								/* translators: %s: ISO timestamp from the export file */
								__( 'Exported at: %s', 'notibar' ),
								parsed._exported_at || '—'
							) }
						</p>
						{ Object.entries(
							sectionCountsFromParsed( parsed )
						).map( ( [ k, n ] ) => (
							<CheckboxControl
								key={ k }
								label={ `${ SECTION_LABELS[ k ] } (${ n })` }
								checked={ !! importSel[ k ] }
								onChange={ ( v ) =>
									setImportSel( {
										...importSel,
										[ k ]: v,
									} )
								}
							/>
						) ) }
						<Button
							variant="primary"
							isDestructive
							disabled={
								importBusy ||
								! SECTIONS.some( ( k ) => importSel[ k ] )
							}
							onClick={ () => setConfirmOpen( true ) }
						>
							{ __( 'Replace selected sections', 'notibar' ) }
						</Button>
					</div>
				) }
			</section>

			{ confirmOpen && (
				<Modal
					title={ __( 'Confirm import', 'notibar' ) }
					onRequestClose={ () => setConfirmOpen( false ) }
				>
					<p>
						{ __(
							'The selected sections will be REPLACED. Continue?',
							'notibar'
						) }
					</p>
					<div className="njt-notibar-export-import__modal-actions">
						<Button
							variant="secondary"
							onClick={ () => setConfirmOpen( false ) }
						>
							{ __( 'Cancel', 'notibar' ) }
						</Button>
						<Button
							variant="primary"
							isDestructive
							isBusy={ importBusy }
							onClick={ handleReplace }
						>
							{ __( 'Yes, replace', 'notibar' ) }
						</Button>
					</div>
				</Modal>
			) }
		</div>
	);
}
