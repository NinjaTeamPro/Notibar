/**
 * Body-push utility — keep the page body padded so a positioned Notibar does
 * not collapse on top of the site header (top bars) or footer (bottom bars).
 *
 * Replaces v2's manual padding logic with a ResizeObserver + MutationObserver
 * combo so dynamic height changes (rotation, collapse-toggle, dismiss, stack
 * rebuild, responsive breakpoints) re-sync automatically.
 *
 * Targets:
 *  - Single / rotation: the lone `.njt-nofi-container` (its data-placement →
 *    which side to pad).
 *  - Stack (Pro): one or two `.njt-nofi-stack` wrappers — a top wrapper and/or
 *    a bottom wrapper. Each side is padded independently by its wrapper height,
 *    so a stack split across top + bottom reserves space on BOTH sides.
 *
 * Applies for data-position in { 'fixed', 'absolute' }. Both float above the
 * normal flow; both need the body push so the initial layout has room. For
 * 'absolute' the bar(s) scroll away with the document; for 'fixed' they stay
 * pinned.
 *
 * Admin-bar coexistence: WordPress already injects `html { margin-top: 32px
 * !important }` (or 46px on narrow viewports) via _admin_bar_bump_cb() to
 * offset for the admin bar. That html margin pushes the body element down
 * already — so we MUST NOT add another adminBarOffset to body padding, or we'd
 * double-count. Body padding here is purely bar/stack height.
 *
 * For the positioned Notibar itself: its CSS `top:0` is overridden to
 * `top: 32px` (or 46px) by the `.admin-bar .njt-nofi-container[...]` /
 * `.admin-bar .njt-nofi-stack[...]` rules in notibar.css so it sits BELOW the
 * admin bar, not behind it.
 *
 * @since 3.0.0
 */
/* eslint-env browser */

const PUSH_POSITIONS = new Set( [ 'fixed', 'absolute' ] );

// Set body padding per side independently. A side with 0px is cleared, so a
// top↔bottom switch (or a dismissed stack group) never leaves stale padding.
function applyBodyPad( topPx, bottomPx ) {
	if ( topPx > 0 ) {
		document.body.style.setProperty(
			'padding-top',
			topPx + 'px',
			'important'
		);
	} else {
		document.body.style.removeProperty( 'padding-top' );
	}
	if ( bottomPx > 0 ) {
		document.body.style.setProperty(
			'padding-bottom',
			bottomPx + 'px',
			'important'
		);
	} else {
		document.body.style.removeProperty( 'padding-bottom' );
	}
}

/**
 * Install body-push on a Notibar slot element.
 *
 * Returns an uninstall function that detaches all observers and clears
 * the body padding.
 *
 * @param {HTMLElement} slot The #njt-notibar-slot element (frontend) or
 *                           preview equivalent.
 * @return {Function} uninstall handler.
 */
export function installBodyPush( slot ) {
	if ( ! slot || typeof ResizeObserver === 'undefined' ) {
		return function noop() {};
	}

	// Currently-observed targets: [{ el, side }] where side is 'top' | 'bottom'.
	let targets = [];
	let sizeObserver = null;

	function sideOf( el ) {
		return 'bottom' === el.getAttribute( 'data-placement' )
			? 'bottom'
			: 'top';
	}

	function pushable( el ) {
		const pos = el.getAttribute( 'data-position' ) || 'fixed';
		return PUSH_POSITIONS.has( pos );
	}

	function sync() {
		// Sum heights per side — stack mode can have a top AND a bottom group.
		let topPx = 0;
		let bottomPx = 0;
		targets.forEach( function ( t ) {
			const h = t.el.offsetHeight;
			if ( 'bottom' === t.side ) {
				bottomPx += h;
			} else {
				topPx += h;
			}
		} );
		applyBodyPad( topPx, bottomPx );
	}

	function findTargets() {
		// Stack mode: the positioned wrappers (one per side). When present they
		// own the layout; the inner containers are position:static and inert.
		const stacks = slot.querySelectorAll( '.njt-nofi-stack' );
		if ( stacks.length ) {
			const out = [];
			stacks.forEach( function ( el ) {
				if ( pushable( el ) ) {
					out.push( { el, side: sideOf( el ) } );
				}
			} );
			return out;
		}
		// Single / rotation: the lone positioned container.
		const bar = slot.querySelector( '.njt-nofi-container' );
		if ( bar && pushable( bar ) ) {
			return [ { el: bar, side: sideOf( bar ) } ];
		}
		return [];
	}

	function sameTargets( a, b ) {
		if ( a.length !== b.length ) {
			return false;
		}
		for ( let i = 0; i < a.length; i++ ) {
			// Compare side too, so a placement flip on the same element still
			// triggers a re-attach (and a fresh sync) rather than padding the
			// stale side.
			if ( a[ i ].el !== b[ i ].el || a[ i ].side !== b[ i ].side ) {
				return false;
			}
		}
		return true;
	}

	function attach( found ) {
		if ( sizeObserver ) {
			sizeObserver.disconnect();
			sizeObserver = null;
		}
		targets = found;
		if ( ! targets.length ) {
			applyBodyPad( 0, 0 );
			return;
		}
		sizeObserver = new ResizeObserver( sync );
		targets.forEach( function ( t ) {
			sizeObserver.observe( t.el );
		} );
		sync();
	}

	attach( findTargets() );

	// Re-attach only when the target ELEMENT SET changes (rotation swaps the
	// container, dismiss/stack-rebuild replaces innerHTML, preview live-replaces
	// on every keystroke). Inner-only changes (a bar removed from inside a stack
	// wrapper) keep the same wrapper element, so the ResizeObserver re-syncs
	// height without a re-attach.
	const slotObserver = new MutationObserver( function () {
		const next = findTargets();
		if ( ! sameTargets( next, targets ) ) {
			attach( next );
		}
	} );
	slotObserver.observe( slot, { childList: true, subtree: true } );

	// Admin-bar offset depends on viewport width (32 vs 46px boundary at 783px).
	function onResize() {
		sync();
	}
	window.addEventListener( 'resize', onResize );

	return function uninstall() {
		if ( sizeObserver ) {
			sizeObserver.disconnect();
		}
		slotObserver.disconnect();
		window.removeEventListener( 'resize', onResize );
		applyBodyPad( 0, 0 );
	};
}
