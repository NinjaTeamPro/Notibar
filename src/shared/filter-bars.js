/**
 * Notibar shared bar-filter module.
 *
 * Pure function: (bars[], ctx) → Bar[]
 * No side-effects, no DOM reads, no global state.
 *
 * Mirrors PHP-side NotificationBarHandle::njt_nofi_isDisplayNotification logic.
 * Phase 07 frontend runtime imports this same module for consistent behaviour.
 *
 * Context shape:
 *   {
 *     pageId:          number,   // current WP page ID (0 if not a page)
 *     postId:          number,   // current WP post ID (0 if not a single post)
 *     isHome:          boolean,  // true when is_home() || is_front_page()
 *     isSingleProduct: boolean,  // true on single WC product
 *     device:          'desktop' | 'mobile',
 *     dismissed:       string[], // bar IDs the visitor already dismissed (cookie-sourced)
 *     isPreview:       boolean,  // true inside Customizer preview iframe
 *     currentCptType:  string,   // CPT slug on single CPT (excl. page/post);
 *                                // '' on page/post/archive/home/non-singular.
 *     currentObjectId: number,   // get_queried_object_id() — populated on any
 *                                // singular; CPT branch is the only consumer.
 *   }
 *
 * @since 3.0.0
 */

// ------------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------------

/**
 * Test whether the given logic rule passes for a given ID list + context.
 *
 * IDs in the schema are numeric (after JSON.parse) plus the literal string
 * "home_page". `ids.includes(currentId)` would fail when types differ, so we
 * normalise both sides to strings before comparing.
 *
 * @param {string}               logic           'all' | 'none' | 'include' | 'exclude'
 * @param {Array<number|string>} ids             Configured ID list (may contain 'home_page').
 * @param {number}               currentId       Numeric ID to test against (0 = not applicable).
 * @param {boolean}              isHome          Whether the current page is the home/front page.
 * @param {boolean}              isSingleProduct Whether the current page is a single WooCommerce product.
 *
 * @return {boolean} true = bar should render for this context.
 */
function passesLogic( logic, ids, currentId, isHome, isSingleProduct ) {
	const target = String( currentId );
	const inList =
		( currentId > 0 && ids.some( ( id ) => String( id ) === target ) ) ||
		( isHome && ids.includes( 'home_page' ) ) ||
		( isSingleProduct && ids.includes( 'wc_single_product' ) );

	switch ( logic ) {
		case 'all':
			return true;
		case 'none':
			return false;
		case 'include':
			return inList;
		case 'exclude':
			return ! inList;
		default:
			return true;
	}
}

/**
 * Test whether the current local time falls inside the given daily window.
 * Empty bounds = unbounded on that side. Supports wrap-around (e.g. 22:00–02:00).
 *
 * @param {string} now   "HH:MM" current site-local time.
 * @param {string} start "HH:MM" or empty.
 * @param {string} end   "HH:MM" or empty.
 * @return {boolean} true = inside window.
 */
function inDailyWindow( now, start, end ) {
	if ( '' === start && '' === end ) {
		return true;
	}
	if ( '' === start ) {
		return now < end;
	}
	if ( '' === end ) {
		return now >= start;
	}
	// Lex compare works because HH:MM is zero-padded.
	if ( start <= end ) {
		return now >= start && now < end;
	}
	// Wrapped window (e.g. 22:00–02:00).
	return now >= start || now < end;
}

/**
 * Schedule filter — date range + day-of-week + daily window.
 *
 * Mirrors NotificationBarHandle::passesSchedule (PHP).
 * Inert when bar.schedule.enabled is false.
 *
 * Per-bar time source:
 *  - schedule.useClientTime === true → visitor browser-local time
 *    (Date.now() / new Date()), ignoring server-emitted ctx fields.
 *  - otherwise → prefer ctx.serverNow/serverWeekday/serverHHMM (so cached
 *    pages agree with what PHP filtered); fall back to client clock when
 *    absent (e.g. Customizer preview iframe).
 *
 * @param {Object} bar Bar object.
 * @param {Object} ctx Context (provides serverNow/serverWeekday/serverHHMM
 *                     if emitted by PHP; otherwise falls back to Date.now()).
 * @return {boolean} true = passes (bar may render).
 */
function passesSchedule( bar, ctx ) {
	const sched = bar.schedule;
	if ( ! sched || ! sched.enabled ) {
		return true;
	}

	// Strict === true so missing/falsy/string values fall through to the
	// existing server-time branch (regression-safe for bars saved before
	// the toggle existed).
	const useClient = sched.useClientTime === true;

	let nowMs;
	let weekday;
	let hhmmNow;

	if ( useClient ) {
		const now = new Date();
		nowMs = now.getTime();
		weekday = now.getDay();
		hhmmNow = formatHHMM( now );
	} else {
		nowMs =
			typeof ctx.serverNow === 'number'
				? ctx.serverNow * 1000
				: Date.now();
		const nowDate = new Date( nowMs );
		weekday =
			typeof ctx.serverWeekday === 'number'
				? ctx.serverWeekday
				: nowDate.getDay();
		hhmmNow =
			typeof ctx.serverHHMM === 'string'
				? ctx.serverHHMM
				: formatHHMM( nowDate );
	}

	// Date range — datetime-local strings; treated as site-local.
	if ( sched.startAt ) {
		const startMs = parseDateTimeLocal( sched.startAt );
		if ( ! isNaN( startMs ) && startMs > nowMs ) {
			return false;
		}
	}
	if ( sched.endAt ) {
		const endMs = parseDateTimeLocal( sched.endAt );
		if ( ! isNaN( endMs ) && endMs <= nowMs ) {
			return false;
		}
	}

	// Day-of-week — empty array = all days (matches PHP behaviour).
	const dow = Array.isArray( sched.daysOfWeek ) ? sched.daysOfWeek : [];
	if ( dow.length > 0 && ! dow.includes( weekday ) ) {
		return false;
	}

	// Daily window.
	const dw = sched.dailyWindow || {};
	if ( dw.enabled && ( dw.start || dw.end ) ) {
		if ( ! inDailyWindow( hhmmNow, dw.start || '', dw.end || '' ) ) {
			return false;
		}
	}

	return true;
}

// Parses "YYYY-MM-DDTHH:MM" (datetime-local) as a local-time timestamp.
// Browsers without a TZ suffix already treat this as local — we just
// guard against bad input.
function parseDateTimeLocal( s ) {
	if ( typeof s !== 'string' || ! s ) {
		return NaN;
	}
	// Append :00 seconds so Date parses consistently across browsers.
	const normalised = s.length === 16 ? s + ':00' : s;
	return new Date( normalised ).getTime();
}

function formatHHMM( date ) {
	const h = String( date.getHours() ).padStart( 2, '0' );
	const m = String( date.getMinutes() ).padStart( 2, '0' );
	return h + ':' + m;
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

/**
 * Filter bars to those that should render in the given context.
 *
 * Preview iframe behaviour (ctx.isPreview === true):
 *  - Device gating is skipped (admin wants to see all bars regardless of
 *    the previewed device width so they can edit them).
 *  - Dismissal cookie check is skipped (no persistence in preview).
 *  - Page/post logic still applies so display-condition settings are testable.
 *
 * @param {Object[]} bars Array of bar objects (Schema::defaultBar() shape).
 * @param {Object}   ctx  Context object — see module docblock for shape.
 *
 * @return {Object[]} Ordered subset of bars that should render.
 */
export function filterBars( bars, ctx ) {
	if ( ! Array.isArray( bars ) ) {
		return [];
	}

	const {
		pageId = 0,
		postId = 0,
		isHome = false,
		isSingleProduct = false,
		device = 'desktop',
		dismissed = [],
		isPreview = false,
		currentCptType = '',
		currentObjectId = 0,
	} = ctx;

	return bars.filter( ( bar ) => {
		// Must be enabled.
		if ( bar.enabled !== true ) {
			return false;
		}

		const display = bar.display || {};

		// Device gate — skipped in preview so admin can see all bars.
		if ( ! isPreview ) {
			const allowedDevices = display.devices || [];
			if ( ! allowedDevices.includes( device ) ) {
				return false;
			}
		}

		// CPT branch ("Other post types") — owns single CPT instances
		// exclusively. When the visitor is on a single CPT page AND admin
		// opted that CPT into `cptTypes`, this branch evaluates cptLogic and
		// SKIPS pageLogic + postLogic entirely. Legacy bars (cptTypes=[]) and
		// non-CPT contexts (page/post/archive/home) fall through to the
		// existing else branch with byte-identical behavior.
		const cptTypes = Array.isArray( display.cptTypes )
			? display.cptTypes
			: [];
		const cptClaimed =
			'' !== currentCptType && cptTypes.includes( currentCptType );

		if ( cptClaimed ) {
			const cptLogic = display.cptLogic || 'all';
			const cptIds = display.cptIds || [];
			if (
				! passesLogic( cptLogic, cptIds, currentObjectId, false, false )
			) {
				return false;
			}
		} else {
			// Page logic
			// `pageLogic` governs every NON-single-post context: pages, home,
			// archives (categories, tags, author, date), WC product, search, 404.
			// `postLogic` (below) governs single posts only — the two are
			// mutually exclusive by context.
			//
			// `none` (hide on all pages) must fire across all those non-single-post
			// contexts unconditionally — including archives where the
			// `pageId > 0 || isHome || isSingleProduct` gate would otherwise skip
			// it. The `postId === 0` guard ensures it does NOT clobber a single
			// post; that context belongs to postLogic.
			const pageLogic = display.pageLogic || 'all';
			if ( 'none' === pageLogic && postId === 0 ) {
				return false;
			}
			if ( pageId > 0 || isHome || isSingleProduct ) {
				if (
					! passesLogic(
						pageLogic,
						display.pageIds || [],
						pageId,
						isHome,
						isSingleProduct
					)
				) {
					return false;
				}
			}

			// Post logic — only applies to single-post contexts. Unlike pageLogic
			// (which is the catch-all for non-post contexts including archives),
			// postLogic='none' means "hide on all single POSTS" — it should NOT
			// fire on pages, the shop, archives, etc. So the postId>0 gate
			// stays around the whole block.
			if ( postId > 0 ) {
				if (
					! passesLogic(
						display.postLogic || 'all',
						display.postIds || [],
						postId,
						false,
						false
					)
				) {
					return false;
				}
			}
		}

		// Dismissal — skipped in preview. Both sides coerced to string
		// because dismissed[] is populated from cookies (strings) while
		// bar.id is the JSON-decoded UUID (may be string already, but
		// be defensive — same coercion lesson as passesLogic above).
		if ( ! isPreview ) {
			const barIdStr = String( bar.id );
			if ( dismissed.some( ( id ) => String( id ) === barIdStr ) ) {
				return false;
			}
		}

		// Schedule — skipped in preview iframe (admin must always see the
		// bar being edited regardless of its schedule window).
		if ( ! isPreview && ! passesSchedule( bar, ctx ) ) {
			return false;
		}

		return true;
	} );
}
