<?php
/**
 * REST API for per-bar interaction tracking.
 *
 * Routes (namespace: notibar/v1):
 *   POST /track                          — anon; record click/dismiss for a bar.
 *   GET  /stats/timeseries               — manage_options; daily grouped counts (charts).
 *   GET  /stats/(?P<bar_id>[A-Za-z0-9_-]+) — manage_options; returns {clicks, dismissals}.
 *
 * Anon POST is intentional (visitor frontend). Defense-in-depth:
 *   - bar_id regex-validated; must also exist in current theme_mod bars list.
 *   - event enum-validated against EventCounter::EVENT_MAP.
 *   - No reflected output (204 on success).
 *   - No PII captured.
 *
 * @package NjtNotificationBar\NotificationBar
 * @since   3.1.0
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

class TrackingRestController {

	/** @var string Shared REST namespace (also used by RestPostsController). */
	const NAMESPACE = 'notibar/v1';

	/**
	 * Register routes on rest_api_init.
	 */
	public function register(): void {
		register_rest_route(
			self::NAMESPACE,
			'/track',
			[
				'methods'             => \WP_REST_Server::CREATABLE,
				'callback'            => [ $this, 'track' ],
				'permission_callback' => '__return_true',
			]
		);

		// v3.1.2 — time-series for charts. MUST register BEFORE the dynamic
		// /stats/(?P<bar_id>) route below: 'timeseries' matches the bar_id
		// regex, and WP REST resolves to the first matching route in
		// registration order, so the literal must come first.
		register_rest_route(
			self::NAMESPACE,
			'/stats/timeseries',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'timeseries' ],
				'permission_callback' => [ $this, 'admin_only' ],
				'args'                => [
					'from'     => [ 'sanitize_callback' => 'sanitize_text_field' ],
					'to'       => [ 'sanitize_callback' => 'sanitize_text_field' ],
					'bar_id'   => [ 'sanitize_callback' => 'sanitize_text_field' ],
					'interval' => [ 'sanitize_callback' => 'sanitize_text_field' ],
				],
			]
		);

		// v3.1.2 — per-bar grouped counts over a range (comparison chart). Also a
		// literal route, so it must precede the dynamic /stats/(?P<bar_id>) below.
		register_rest_route(
			self::NAMESPACE,
			'/stats/by-bar',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'by_bar' ],
				'permission_callback' => [ $this, 'admin_only' ],
				'args'                => [
					'from' => [ 'sanitize_callback' => 'sanitize_text_field' ],
					'to'   => [ 'sanitize_callback' => 'sanitize_text_field' ],
				],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/stats/(?P<bar_id>[A-Za-z0-9_-]+)',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'stats' ],
				'permission_callback' => [ $this, 'admin_only' ],
			]
		);

		// v3.1 — bulk read for the in-SPA Tracking pane (aggregate view).
		// Returns the raw counters map { <bar_id>: {clicks, dismissals} }.
		register_rest_route(
			self::NAMESPACE,
			'/stats',
			[
				'methods'             => \WP_REST_Server::READABLE,
				'callback'            => [ $this, 'stats_all' ],
				'permission_callback' => [ $this, 'admin_only' ],
			]
		);
	}

	/**
	 * GET /stats — admin gate.
	 */
	public function admin_only(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * POST /track handler.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function track( \WP_REST_Request $request ) {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = [];
		}

		$bar_id = isset( $params['bar_id'] ) ? (string) $params['bar_id'] : '';
		$event  = isset( $params['event'] ) ? (string) $params['event'] : '';

		if ( ! preg_match( EventCounter::BAR_ID_REGEX, $bar_id ) ) {
			return new \WP_Error(
				'notibar_invalid_bar_id',
				__( 'Invalid bar_id.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		if ( ! isset( EventCounter::EVENT_MAP[ $event ] ) ) {
			return new \WP_Error(
				'notibar_invalid_event',
				__( 'Invalid event.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		if ( ! in_array( $bar_id, self::valid_bar_ids(), true ) ) {
			return new \WP_Error(
				'notibar_unknown_bar',
				__( 'Unknown bar.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		if ( ! EventCounter::increment( $bar_id, $event ) ) {
			// Option row missing (e.g. install bailed on MySQL <5.7) or DB error.
			// Surface as 500 so monitoring catches silent-data-loss regressions.
			return new \WP_Error(
				'notibar_track_failed',
				__( 'Counter increment failed.', 'notibar' ),
				[ 'status' => 500 ]
			);
		}

		// v3.1.2 — additive raw event row for time-series charts. Best-effort:
		// the aggregate above is authoritative, so a raw-insert failure is
		// logged but does NOT fail the request. is_logged_in is a boolean
		// flag only (no user_id, no PII).
		//
		// Detect logged-in visitors from the auth cookie directly rather than
		// is_user_logged_in(): the frontend beacon (navigator.sendBeacon) cannot
		// send an X-WP-Nonce header, and WP core resets nonce-less cookie REST
		// requests to user 0 (rest_cookie_check_errors → wp_set_current_user(0)),
		// so is_user_logged_in() is always false here. wp_validate_auth_cookie()
		// cryptographically validates the logged_in cookie independent of the
		// nonce and is page-cache safe (the cookie travels with each request).
		//
		// Gate on cookie presence first: guests carry no logged_in cookie, so
		// this skips validation for them entirely — avoiding both the work and
		// the auth_cookie_malformed action (which security plugins hook) firing
		// on every anonymous beacon.
		$logged_in = ! empty( $_COOKIE[ LOGGED_IN_COOKIE ] )
			&& (bool) wp_validate_auth_cookie( '', 'logged_in' );
		if ( ! EventLog::insert( $bar_id, $event, $logged_in ) ) {
			error_log( 'Notibar: raw event insert failed for ' . $bar_id );
		}

		return new \WP_REST_Response( null, 204 );
	}

	/**
	 * GET /stats/{bar_id} handler. Admin-gated.
	 */
	public function stats( \WP_REST_Request $request ): \WP_REST_Response {
		$bar_id = (string) $request['bar_id'];
		return new \WP_REST_Response( EventCounter::read( $bar_id ), 200 );
	}

	/**
	 * GET /stats (bulk) handler. Admin-gated.
	 * Returns the raw counters map keyed by bar_id.
	 */
	public function stats_all(): \WP_REST_Response {
		$raw  = get_option( 'notibar_counters', '{}' );
		$data = is_array( $raw ) ? $raw : json_decode( (string) $raw, true );
		if ( ! is_array( $data ) ) {
			$data = [];
		}
		return new \WP_REST_Response( $data, 200 );
	}

	/**
	 * GET /stats/timeseries handler. Admin-gated.
	 *
	 * Params: from (Y-m-d), to (Y-m-d), bar_id (optional), interval (day only).
	 * Defaults: to=today (UTC), from=to-30d. Range clamped to ≤366 days.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function timeseries( \WP_REST_Request $request ) {
		$interval = (string) $request->get_param( 'interval' );
		if ( '' === $interval ) {
			$interval = 'day';
		}
		if ( 'day' !== $interval ) {
			return new \WP_Error(
				'notibar_invalid_interval',
				__( 'Only interval=day is supported.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		$range = $this->resolve_range( $request );
		if ( is_wp_error( $range ) ) {
			return $range;
		}

		$bar_id = (string) $request->get_param( 'bar_id' );
		if ( '' !== $bar_id && ! preg_match( EventCounter::BAR_ID_REGEX, $bar_id ) ) {
			return new \WP_Error(
				'notibar_invalid_bar_id',
				__( 'Invalid bar_id.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		$series = EventLog::timeseries(
			$range['start'],
			$range['end_exclusive'],
			'' !== $bar_id ? $bar_id : null
		);

		return new \WP_REST_Response(
			[
				'interval' => 'day',
				'from'     => $range['from'],
				'to'       => $range['to'],
				'bar_id'   => '' !== $bar_id ? $bar_id : null,
				'series'   => $series,
			],
			200
		);
	}

	/**
	 * GET /stats/by-bar handler. Admin-gated.
	 *
	 * Per-bar grouped counts over the range — ALL bars (ignores any bar_id;
	 * the comparison is inherently cross-bar). Audience/event filtering is
	 * applied client-side. Defaults: to=today (UTC), from=to-30d.
	 *
	 * @return \WP_REST_Response|\WP_Error
	 */
	public function by_bar( \WP_REST_Request $request ) {
		$range = $this->resolve_range( $request );
		if ( is_wp_error( $range ) ) {
			return $range;
		}

		return new \WP_REST_Response(
			[
				'from'   => $range['from'],
				'to'     => $range['to'],
				'series' => EventLog::byBar( $range['start'], $range['end_exclusive'] ),
			],
			200
		);
	}

	/**
	 * Validate from/to params and compute UTC query bounds. Shared by
	 * timeseries() and by_bar(). Defaults to=today, from=to-30d; clamps ≤366d.
	 *
	 * @return array{from:string,to:string,start:string,end_exclusive:string}|\WP_Error
	 */
	private function resolve_range( \WP_REST_Request $request ) {
		// Defaults in UTC to match stored created_at.
		$today = current_time( 'Y-m-d', true );
		$to    = (string) $request->get_param( 'to' );
		$from  = (string) $request->get_param( 'from' );
		if ( '' === $to ) {
			$to = $today;
		}
		if ( '' === $from ) {
			$from = gmdate( 'Y-m-d', strtotime( $to . ' 00:00:00 UTC' ) - 30 * DAY_IN_SECONDS );
		}

		if ( ! self::is_ymd( $from ) || ! self::is_ymd( $to ) ) {
			return new \WP_Error(
				'notibar_invalid_date',
				__( 'from/to must be valid YYYY-MM-DD dates.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		$from_ts = strtotime( $from . ' 00:00:00 UTC' );
		$to_ts   = strtotime( $to . ' 00:00:00 UTC' );
		// Defensive: strtotime() returns false on 32-bit PHP for post-2038
		// dates. is_ymd() already rejected malformed input, but guard the
		// arithmetic below so a false→0 cast can't silently skew the range.
		if ( false === $from_ts || false === $to_ts ) {
			return new \WP_Error(
				'notibar_invalid_date',
				__( 'from/to must be valid YYYY-MM-DD dates.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}
		if ( $from_ts > $to_ts ) {
			return new \WP_Error(
				'notibar_invalid_range',
				__( '`from` must not be after `to`.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}
		if ( ( $to_ts - $from_ts ) > 366 * DAY_IN_SECONDS ) {
			return new \WP_Error(
				'notibar_range_too_large',
				__( 'Date range must not exceed 366 days.', 'notibar' ),
				[ 'status' => 400 ]
			);
		}

		return [
			'from'          => $from,
			'to'            => $to,
			// UTC datetime literals — match the created_at storage basis.
			'start'         => $from . ' 00:00:00',
			'end_exclusive' => gmdate( 'Y-m-d', $to_ts + DAY_IN_SECONDS ) . ' 00:00:00',
		];
	}

	/**
	 * True when $date is a real calendar date in strict YYYY-MM-DD form.
	 */
	private static function is_ymd( string $date ): bool {
		if ( ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $date, $m ) ) {
			return false;
		}
		return checkdate( (int) $m[2], (int) $m[3], (int) $m[1] );
	}

	/**
	 * Bar IDs currently registered in theme_mod njt_nofi_bars.
	 *
	 * Mirrors the decode pattern used in NotificationBarHandle / WpmlBridge.
	 *
	 * @return string[]
	 */
	public static function valid_bar_ids(): array {
		$raw  = get_option( 'njt_nofi_bars', '[]' );
		$bars = json_decode( (string) $raw, true );
		if ( ! is_array( $bars ) ) {
			return [];
		}
		$ids = [];
		foreach ( $bars as $bar ) {
			if ( is_array( $bar ) && ! empty( $bar['id'] ) && is_string( $bar['id'] ) ) {
				$ids[] = $bar['id'];
			}
		}
		return $ids;
	}
}
