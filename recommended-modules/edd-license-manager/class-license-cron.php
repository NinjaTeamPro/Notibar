<?php

defined( 'ABSPATH' ) || exit;

/**
 * Daily background license re-check (WP-Cron).
 *
 * Re-validates currently-usable (valid|expired) keyed plugins against the EDD store once a day, so the
 * stored status stays honest (expiry/revocation detected, renewal recovered) without a manual refresh.
 *
 * Network-resilient: client->check() does NOT persist on a store outage (returns WP_Error before save),
 * so a transient failure never false-invalidates a good license. Only genuine store responses update it.
 *
 * NOTE: relies on WP-Cron. Hosts with WP-Cron disabled won't auto-recheck (manual Refresh still works).
 * PHP 7.1+ compatible.
 */
if ( ! class_exists( 'NjtEddLicenseCron' ) ) {
	class NjtEddLicenseCron {

		const HOOK = 'njt_edd_license_recheck';

		/** @var NjtEddLicenseApiClient */
		private $client;

		/** @var array<string, array> Registered configs keyed by slug. */
		private $plugins;

		public function __construct( NjtEddLicenseApiClient $client, array $plugins ) {
			$this->client  = $client;
			$this->plugins = $plugins;
		}

		/** Hook the recheck handler and schedule the daily event once (idempotent). */
		public function register() {
			add_action( self::HOOK, [ $this, 'run' ] );
			if ( ! wp_next_scheduled( self::HOOK ) ) {
				wp_schedule_event( time() + DAY_IN_SECONDS, 'daily', self::HOOK );
			}
		}

		/** Re-check currently-usable (valid|expired) licenses that have a stored key. */
		public function run() {
			foreach ( $this->plugins as $cfg ) {
				if ( '' === $this->client->get_key( $cfg ) ) {
					continue; // No key → nothing to check.
				}
				if ( ! in_array( $this->client->get_status( $cfg ), [ 'valid', 'expired' ], true ) ) {
					continue; // Only re-check usable licenses; invalid/disabled recover via manual Activate.
				}
				$this->client->check( $cfg ); // Persists the refreshed status; no-op on store outage.
			}
		}
	}
}
