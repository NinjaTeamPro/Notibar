/**
 * Notibar per-bar event tracking.
 *
 * Fires `navigator.sendBeacon` to POST {bar_id, event} at `notibar/v1/track`.
 * Falls back to fetch+keepalive when sendBeacon is unavailable or refuses
 * the payload.
 *
 * Event taxonomy (three mutually-exclusive counters):
 *   - click   → primary CTA button click (.njt-nofi-button-text)
 *   - dismiss → close button click       (.njt-nofi-close)
 *   - engage  → click or text-copy inside the bar, EXCLUDING the CTA button
 *               and the close button. Counts non-CTA, non-dismiss interactions
 *               only (background clicks, text clicks, embedded link clicks,
 *               text copy on non-CTA content).
 *
 * Fire-and-forget: errors are swallowed (counters, not billing).
 *
 * Listener is capture-phase on `document` so it fires before the existing
 * slot-level dismiss handler — avoids losing the beacon if the dismiss
 * code removes the DOM subtree synchronously.
 *
 * @since 3.1.0
 */
( function () {
	var cfg = window.njtNotibarTracking;
	if ( ! cfg || ! cfg.endpoint ) {
		return;
	}

	var CTA_SEL   = '.njt-nofi-button-text';
	var CLOSE_SEL = '.njt-nofi-close';
	var BAR_SEL   = '[data-bar-id]';

	function send( barId, event ) {
		var body = JSON.stringify( { bar_id: barId, event: event } );
		try {
			var blob = new Blob( [ body ], { type: 'application/json' } );
			if ( navigator.sendBeacon && navigator.sendBeacon( cfg.endpoint, blob ) ) {
				return;
			}
		} catch ( _ ) { /* Blob unavailable on very old browsers — fall through. */ }

		try {
			fetch( cfg.endpoint, {
				method:    'POST',
				keepalive: true,
				body:      body,
				headers:   { 'Content-Type': 'application/json' }
			} );
		} catch ( _ ) { /* swallow */ }
	}

	function dispatch( e, sel, eventName ) {
		var hit = e.target && e.target.closest ? e.target.closest( sel ) : null;
		if ( ! hit ) {
			return;
		}
		var bar = hit.closest( BAR_SEL );
		var id  = bar ? bar.getAttribute( 'data-bar-id' ) : null;
		if ( id ) {
			send( id, eventName );
		}
	}

	document.addEventListener( 'click', function ( e ) {
		dispatch( e, CTA_SEL,   'click' );
		dispatch( e, CLOSE_SEL, 'dismiss' );

		// Engage: click inside the bar, EXCLUDING the CTA button and close
		// button. Three counters stay mutually exclusive — CTA hits 'click'
		// only, close hits 'dismiss' only, everything else hits 'engage'.
		if ( ! e.target || ! e.target.closest ) {
			return;
		}
		var bar     = e.target.closest( BAR_SEL );
		var isCTA   = e.target.closest( CTA_SEL );
		var isClose = e.target.closest( CLOSE_SEL );
		if ( bar && ! isCTA && ! isClose ) {
			var id = bar.getAttribute( 'data-bar-id' );
			if ( id ) {
				send( id, 'engage' );
			}
		}
	}, true );

	// Engage: text copy with the active selection anchored inside the bar,
	// but NOT inside the CTA button (mirrors the click exclusion above).
	// Fires once per Cmd/Ctrl+C so an admin can see whether visitors copy
	// bar content (coupon codes, support links, etc.) without clicking the
	// CTA.
	document.addEventListener( 'copy', function () {
		var sel = window.getSelection ? window.getSelection() : null;
		if ( ! sel || sel.isCollapsed ) {
			return;
		}
		var node  = sel.anchorNode;
		var el    = node && node.nodeType === 3 ? node.parentElement : node;
		var bar   = el && el.closest ? el.closest( BAR_SEL ) : null;
		var isCTA = el && el.closest ? el.closest( CTA_SEL ) : null;
		if ( bar && ! isCTA ) {
			var id = bar.getAttribute( 'data-bar-id' );
			if ( id ) {
				send( id, 'engage' );
			}
		}
	} );
}() );
