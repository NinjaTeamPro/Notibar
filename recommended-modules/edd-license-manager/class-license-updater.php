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
				if ( empty( $cfg['file'] ) ) {
					continue; // No plugin main file registered.
				}
				$file_abs = WP_PLUGIN_DIR . '/' . $cfg['file'];
				if ( ! file_exists( $file_abs ) ) {
					continue; // Can't locate the plugin main file.
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
	}
}
