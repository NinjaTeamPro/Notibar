<?php

defined( 'ABSPATH' ) || exit;

/**
 * Plugins-list row notice.
 *
 * For each registered plugin that has a `file`, shows an amber notice strip in the Plugins list row
 * (after_plugin_row) while the license is not valid:
 *   - expired                    → renew prompt linking to the account/store URL
 *   - invalid/empty/disabled/…   → activate prompt linking to the plugin's License page
 *   - valid                      → nothing
 * Styling uses WP core notice classes (always present in admin) so no extra CSS is needed. PHP 7.1+.
 */
if ( ! class_exists( 'NjtEddLicenseRowNotice' ) ) {
	class NjtEddLicenseRowNotice {

		/** @var NjtEddLicenseApiClient */
		private $client;

		/** @var array<string, array> Registered configs keyed by slug. */
		private $plugins;

		public function __construct( NjtEddLicenseApiClient $client, array $plugins ) {
			$this->client  = $client;
			$this->plugins = $plugins;
		}

		/** Hook the row notice for every registered plugin that has a main file. */
		public function register() {
			foreach ( $this->plugins as $cfg ) {
				if ( empty( $cfg['file'] ) ) {
					continue; // No plugin file → no row to target.
				}
				add_action(
					'after_plugin_row_' . plugin_basename( $cfg['file'] ),
					function ( $file ) use ( $cfg ) { // WP passes 3 args; we only need $plugin_file
						$this->render_row( $cfg, $file );
					},
					10,
					1
				);
			}
		}

		/** Render the row notice for one plugin (skips when the license is valid). */
		public function render_row( array $cfg, $file ) {
			$status = $this->client->get_status( $cfg );
			if ( 'valid' === $status ) {
				return; // Licensed → no notice.
			}

			if ( 'expired' === $status ) {
				$url = ! empty( $cfg['account_url'] ) ? $cfg['account_url'] : $cfg['store_url'];
				$msg = sprintf(
					/* translators: %s: plugin name */
					__( 'Your %s license has expired. Renew it to keep receiving automatic updates and support.', 'filebird' ),
					$cfg['name']
				);
			} else {
				$url = menu_page_url( $cfg['option_prefix'] . '-license', false );
				$msg = __( 'Please activate your license for access to premium features and automatic updates.', 'filebird' );
			}

			if ( empty( $url ) ) {
				return; // Nowhere to link (e.g. no License page registered).
			}

			$cols = ( isset( $GLOBALS['wp_list_table'] ) && is_object( $GLOBALS['wp_list_table'] ) )
				? (int) $GLOBALS['wp_list_table']->get_column_count()
				: 4;

			printf(
				'<tr class="plugin-update-tr active" data-plugin="%s"><td colspan="%s" class="plugin-update colspanchange">'
					. '<div class="update-message notice inline notice-warning notice-alt"><p>'
					. '<a href="%s">%s</a></p></div></td></tr>',
				esc_attr( $file ),
				esc_attr( $cols ),
				esc_url( $url ),
				esc_html( $msg )
			);
		}
	}
}
