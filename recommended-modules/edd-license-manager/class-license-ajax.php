<?php

defined( 'ABSPATH' ) || exit;

/**
 * License AJAX handlers (activate / deactivate / check).
 *
 * Every handler: verify nonce → capability → resolve slug to a REGISTERED config
 * (rejects arbitrary store_url use) → sanitize input. The license key is never
 * returned in the JSON payload. PHP 7.1+ compatible.
 */
if ( ! class_exists( 'NjtEddLicenseAjax' ) ) {
	class NjtEddLicenseAjax {

		const NONCE = 'njt_edd_license_nonce';

		/** @var NjtEddLicenseApiClient */
		private $client;

		public function __construct( NjtEddLicenseApiClient $client ) {
			$this->client = $client;
		}

		public function register() {
			add_action( 'wp_ajax_njt_edd_license_activate', [ $this, 'activate' ] );
			add_action( 'wp_ajax_njt_edd_license_deactivate', [ $this, 'deactivate' ] );
			add_action( 'wp_ajax_njt_edd_license_check', [ $this, 'check' ] );
			add_action( 'wp_ajax_njt_edd_license_update_check', [ $this, 'update_check' ] );
		}

		/** Verify nonce + capability, then resolve POST slug to a registered config. */
		private function guard_and_config() {
			check_ajax_referer( self::NONCE, 'nonce' );
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_send_json_error( [ 'message' => __( 'You are not allowed to do this.', 'filebird' ) ], 403 );
			}
			$slug    = isset( $_POST['slug'] ) ? sanitize_key( wp_unslash( $_POST['slug'] ) ) : ''; // match normalize_config indexing
			$plugins = \NjtEddLicenseManagerMain::get_instance()->get_plugins();
			if ( '' === $slug || ! isset( $plugins[ $slug ] ) ) {
				wp_send_json_error( [ 'message' => __( 'Unknown plugin.', 'filebird' ) ] );
			}
			return $plugins[ $slug ];
		}

		public function activate() {
			$cfg = $this->guard_and_config();
			$key = isset( $_POST['license'] ) ? sanitize_text_field( wp_unslash( $_POST['license'] ) ) : '';
			if ( '' === $key ) {
				wp_send_json_error( [ 'message' => __( 'Please enter a license key.', 'filebird' ) ] );
			}
			$this->respond( $this->client->activate( $cfg, $key ) );
		}

		public function deactivate() {
			$cfg = $this->guard_and_config();
			$this->respond( $this->client->deactivate( $cfg ) );
		}

		public function check() {
			$cfg = $this->guard_and_config();
			$this->respond( $this->client->check( $cfg ) );
		}

		/** Manual "Check for updates": force WP to re-query, then report latest version + changelog. */
		public function update_check() {
			$cfg = $this->guard_and_config();
			delete_site_transient( 'update_plugins' ); // make WP re-run the updater filters
			$res = $this->client->get_version( $cfg );
			if ( is_wp_error( $res ) ) {
				wp_send_json_error( [ 'message' => $res->get_error_message() ] );
			}
			$changelog = '';
			if ( ! empty( $res['sections'] ) ) {
				// EDD serializes `sections` (PHP-serialize) inside the JSON body, not JSON.
				$sections = maybe_unserialize( $res['sections'] );
				if ( is_array( $sections ) && ! empty( $sections['changelog'] ) ) {
					$changelog = wp_kses_post( $sections['changelog'] );
				}
			}
			$new_version = isset( $res['new_version'] ) ? sanitize_text_field( $res['new_version'] ) : '';
			wp_send_json_success( [
				'new_version' => $new_version,
				'current'     => $cfg['version'],
				'has_update'  => ( '' !== $new_version && version_compare( $cfg['version'], $new_version, '<' ) ),
				'url'         => isset( $res['url'] ) ? esc_url_raw( $res['url'] ) : '',
				'changelog'   => $changelog,
			] );
		}

		/** Send the normalized result; deliberately omits the license key. */
		private function respond( $res ) {
			if ( is_wp_error( $res ) ) {
				wp_send_json_error( [ 'message' => $res->get_error_message() ] );
			}
			wp_send_json_success( [
				'status'           => $res['status'],
				'expires'          => $res['expires'],
				'activations_left' => $res['activations_left'],
				'error'            => $res['error'],
			] );
		}
	}
}
