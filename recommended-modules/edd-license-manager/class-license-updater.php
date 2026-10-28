<?php

defined( 'ABSPATH' ) || exit;

/**
 * Wires the bundled EDD updater per registered plugin so WordPress can detect AND apply updates.
 *
 * Registered on `init` (which fires in BOTH wp-admin and WP-Cron) — NOT `admin_init`. WordPress
 * rebuilds the `update_plugins` transient and runs background auto-updates during cron, where
 * `admin_init` never fires; wiring on `admin_init` would limit updates to admin page views and
 * break automatic background auto-updates. Front-end requests are skipped for performance.
 * PHP 7.1+ compatible.
 */
if ( ! class_exists( 'NjtEddLicenseUpdater' ) ) {
	class NjtEddLicenseUpdater {

		/** @var NjtEddLicenseApiClient */
		private $client;

		/** @var array<string, array> Registered configs keyed by slug. */
		private $plugins;

		public function __construct( NjtEddLicenseApiClient $client, array $plugins ) {
			$this->client  = $client;
			$this->plugins = $plugins;
		}

		public function register() {
			add_action( 'init', [ $this, 'wire' ] );
			// Premium plugins must never be served by WordPress.org. When a Pro build
			// runs under a slug that also exists on .org (e.g. the canonical "notibar"
			// slug shared with the free edition), core's update-check would otherwise
			// fetch the FREE package and overwrite Pro on "Update". Strip our registered
			// plugins from the .org update-check payload so the bundled EDD updater is
			// the only update source for them. Hooked here (not in wire) so it applies
			// in admin AND cron regardless of license-key presence.
			add_filter( 'http_request_args', [ $this, 'exclude_from_wporg_check' ], 10, 2 );
		}

		/** Instantiate the EDD updater for each registered plugin that has a stored license key. */
		public function wire() {
			// Only wp-admin and WP-Cron rebuild/apply the update_plugins transient.
			if ( ! is_admin() && ! wp_doing_cron() ) {
				return;
			}
			if ( ! class_exists( '\\EDD_SL_Plugin_Updater' ) ) {
				require_once __DIR__ . '/lib/EDD_SL_Plugin_Updater.php';
			}
			foreach ( $this->plugins as $cfg ) {
				$key = $this->client->get_key( $cfg );
				if ( '' === $key ) {
					continue; // No key → nothing to check.
				}
				$file_abs = $this->client->resolve_plugin_file( $cfg );
				if ( '' === $file_abs ) {
					continue; // No registered main file, or it can't be located.
				}
				new \EDD_SL_Plugin_Updater(
					esc_url_raw( $cfg['store_url'] ),
					$file_abs,
					[
						'version' => $cfg['version'],
						'license' => $key,
						'item_id' => (int) $cfg['item_id'],
						'author'  => isset( $cfg['author'] ) ? $cfg['author'] : '',
						'beta'    => false,
					]
				);
			}
		}

		/**
		 * Remove our registered (premium) plugins from the api.wordpress.org
		 * update-check payload so WordPress.org can never offer a competing
		 * package for a slug we manage via EDD. Fires for every outbound HTTP
		 * request, so it bails fast on anything but the update-check endpoint.
		 *
		 * @param array  $args HTTP request args; body['plugins'] is a JSON list.
		 * @param string $url  Request URL.
		 * @return array
		 */
		public function exclude_from_wporg_check( $args, $url ) {
			if ( false === strpos( (string) $url, '//api.wordpress.org/plugins/update-check' ) ) {
				return $args; // Not the .org update-check request.
			}
			if ( empty( $args['body']['plugins'] ) ) {
				return $args;
			}
			$payload = json_decode( $args['body']['plugins'], true );
			if ( ! is_array( $payload ) || empty( $payload['plugins'] ) ) {
				return $args;
			}
			foreach ( $this->plugins as $cfg ) {
				$file_abs = $this->client->resolve_plugin_file( $cfg );
				if ( '' === $file_abs ) {
					continue;
				}
				$basename = plugin_basename( $file_abs );
				unset( $payload['plugins'][ $basename ] );
				if ( ! empty( $payload['active'] ) && is_array( $payload['active'] ) ) {
					$payload['active'] = array_values( array_diff( $payload['active'], [ $basename ] ) );
				}
			}
			$args['body']['plugins'] = wp_json_encode( $payload );

			return $args;
		}
	}
}
