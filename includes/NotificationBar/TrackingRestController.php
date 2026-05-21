<?php
/**
 * REST API for per-bar interaction tracking.
 *
 * Routes (namespace: notibar/v1):
 *   POST /track                          — anon; record click/dismiss for a bar.
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
