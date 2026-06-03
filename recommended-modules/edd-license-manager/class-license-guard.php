<?php

defined( 'ABSPATH' ) || exit;

/**
 * Optional admin-page guard.
 *
 * While a plugin's license is not usable (status NOT in {valid, expired}), its declared admin
 * pages are redirected to that plugin's License page — forcing activation before use. Opt-in per
 * plugin via the 'gated_pages' config (array of admin `?page=` slugs). The License page itself is
 * never gated (escape hatch), and plugins without a License page (no parent_slug) are skipped.
 * PHP 7.1+ compatible.
 */
if ( ! class_exists( 'NjtEddLicenseGuard' ) ) {
	class NjtEddLicenseGuard {

		/** @var NjtEddLicenseApiClient */
		private $client;

		/** @var array<string, array> Registered configs keyed by slug. */
		private $plugins;

		public function __construct( NjtEddLicenseApiClient $client, array $plugins ) {
			$this->client  = $client;
			$this->plugins = $plugins;
		}

		public function register() {
			add_action( 'admin_init', [ $this, 'maybe_redirect' ] );
		}

		/** Redirect a gated admin page to its License page when the license is not usable. */
		public function maybe_redirect() {
			// sanitize_key lowercases + strips to [a-z0-9_-]; gated_pages slugs must match that form.
			$page = isset( $_GET['page'] ) ? sanitize_key( wp_unslash( $_GET['page'] ) ) : '';
			if ( '' === $page ) {
				return;
			}

			foreach ( $this->plugins as $cfg ) {
				if ( empty( $cfg['gated_pages'] ) || empty( $cfg['parent_slug'] ) ) {
					continue; // Not opted in, or no License page to redirect to.
				}

				$license_slug = $cfg['option_prefix'] . '-license';
				if ( $page === $license_slug ) {
					continue; // Never gate the escape hatch.
				}
				if ( ! in_array( $page, (array) $cfg['gated_pages'], true ) ) {
					continue; // Not a gated page for this plugin.
				}
				if ( njt_edd_license_status_usable( $this->client->get_status( $cfg ) ) ) {
					continue; // valid|expired → allowed.
				}

				$url = menu_page_url( $license_slug, false );
				if ( $url ) {
					wp_safe_redirect( $url );
					exit;
				}
				continue; // Matched but no License URL — don't block; keep checking other plugins.
			}
		}
	}
}
