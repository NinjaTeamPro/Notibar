#!/usr/bin/env node
/**
 * strip-pro.js — turn a staged Pro tree into a Lite tree.
 *
 * Usage:  node build-tools/strip-pro.js <target-dir>
 *
 * Operates IN PLACE on <target-dir> (always a throwaway staging copy — never
 * the working tree). Reads build-tools/pro-manifest.json and:
 *   1. replace : copy source(repo-root) over target(<target-dir>/...) files
 *   2. remove  : delete Pro-only whole files
 *   3. markers : delete every region between `@pro` and `@endpro` (inclusive)
 *                from remaining .php/.js/.jsx/.scss/.css files
 *
 * Marker forms (comment style is irrelevant — only the token matters):
 *   // @pro            /* @pro * /            # @pro
 *   ... pro code ...
 *   // @endpro         /* @endpro * /         # @endpro
 *
 * Exit non-zero on any unbalanced marker so a broken strip fails the release.
 */
'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const REPO_ROOT = path.resolve( __dirname, '..' );
const MANIFEST = path.join( __dirname, 'pro-manifest.json' );
const STRIP_EXT = new Set( [ '.php', '.js', '.jsx', '.scss', '.css' ] );

function fail( msg ) {
	process.stderr.write( `strip-pro: ERROR ${ msg }\n` );
	process.exit( 1 );
}

function walk( dir, out ) {
	for ( const entry of fs.readdirSync( dir, { withFileTypes: true } ) ) {
		const full = path.join( dir, entry.name );
		if ( entry.isDirectory() ) {
			// Skip dirs never shipped — and build-tools, which contains the
			// marker tokens in this script's own docs (self-strip would abort).
			if (
				entry.name === 'node_modules' ||
				entry.name === '.git' ||
				entry.name === 'build-tools' ||
				entry.name === 'release' ||
				entry.name === 'plans'
			) {
				continue;
			}
			walk( full, out );
		} else if ( STRIP_EXT.has( path.extname( entry.name ) ) ) {
			out.push( full );
		}
	}
	return out;
}

/**
 * Remove @pro…@endpro regions from a source string.
 * @param  src
 * @return {{ out: string, removed: number, open: boolean }}
 */
function stripMarkers( src ) {
	const lines = src.split( '\n' );
	const kept = [];
	let depth = 0;
	let removed = 0;
	for ( const line of lines ) {
		// Check @endpro before @pro: '@endpro' does not contain the token '@pro'.
		if ( line.includes( '@endpro' ) ) {
			if ( depth === 0 ) {
				return { out: src, removed, open: false, unbalanced: true };
			}
			depth--;
			removed++;
			continue;
		}
		if ( line.includes( '@pro' ) ) {
			depth++;
			removed++;
			continue;
		}
		if ( depth === 0 ) {
			kept.push( line );
		} else {
			removed++;
		}
	}
	return { out: kept.join( '\n' ), removed, open: depth > 0 };
}

function main() {
	const target = process.argv[ 2 ];
	if ( ! target ) {
		fail( 'missing <target-dir> argument' );
	}
	const targetDir = path.resolve( target );
	if ( ! fs.existsSync( targetDir ) ) {
		fail( `target dir does not exist: ${ targetDir }` );
	}

	const manifest = JSON.parse( fs.readFileSync( MANIFEST, 'utf8' ) );

	// 1. replace
	for ( const [ rel, srcRel ] of Object.entries( manifest.replace || {} ) ) {
		const dest = path.join( targetDir, rel );
		const srcAbs = path.join( REPO_ROOT, srcRel );
		if ( ! fs.existsSync( srcAbs ) ) {
			fail( `replace source missing: ${ srcRel }` );
		}
		if ( fs.existsSync( dest ) ) {
			fs.copyFileSync( srcAbs, dest );
			process.stdout.write( `  replaced ${ rel }\n` );
		}
	}

	// 2. remove
	for ( const rel of manifest.remove || [] ) {
		const dest = path.join( targetDir, rel );
		if ( fs.existsSync( dest ) ) {
			fs.rmSync( dest, { force: true } );
			process.stdout.write( `  removed  ${ rel }\n` );
		}
	}

	// 3. markers
	let filesChanged = 0;
	let linesRemoved = 0;
	for ( const file of walk( targetDir, [] ) ) {
		const src = fs.readFileSync( file, 'utf8' );
		if ( ! src.includes( '@pro' ) ) {
			continue;
		}
		const res = stripMarkers( src );
		if ( res.unbalanced ) {
			fail(
				`@endpro without matching @pro in ${ path.relative(
					targetDir,
					file
				) }`
			);
		}
		if ( res.open ) {
			fail(
				`unterminated @pro region in ${ path.relative(
					targetDir,
					file
				) }`
			);
		}
		fs.writeFileSync( file, res.out );
		filesChanged++;
		linesRemoved += res.removed;
	}

	process.stdout.write(
		`strip-pro: done — ${ filesChanged } files stripped, ${ linesRemoved } lines removed\n`
	);
}

main();
