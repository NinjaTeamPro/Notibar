<?php

defined( 'ABSPATH' ) || exit;

/**
 * EDD Software Licensing API client + option storage (pure data layer).
 *
 * Stateless except option helpers; every call receives a normalized plugin config
 * (see NjtEddLicenseManagerMain). No UI, no AJAX, no nonces here — the AJAX layer
 * (Phase 4) owns capability/nonce checks.
 *
 * SECURITY: sslverify is always true; the license key is sanitized on input and is
 * NEVER written to logs or error output.
 *
 * PHP 7.1+ compatible — intentionally omits strict_types and typed return hints.
 */
if ( ! class_exists( 'NjtEddLicenseApiClient' ) ) {
	class NjtEddLicenseApiClient {

		const TIMEOUT = 15;

		/**
		 * POST an edd_action to the plugin's store. Returns decoded array or WP_Error.
		 *
		 * @param array  $cfg     Normalized plugin config (store_url, item_id, option_prefix).
		 * @param string $action  edd_action: activate_license|deactivate_license|check_license|get_version.
		 * @param string $license Optional explicit key; falls back to the stored key.
		 * @return array|\WP_Error
		 */
		public function request( array $cfg, $action, $license = '' ) {
			$license = '' !== $license ? $license : $this->get_key( $cfg );

			$resp = wp_remote_post( esc_url_raw( $cfg['store_url'] ), [
				'timeout'   => self::TIMEOUT,
				'sslverify' => true,
				'body'      => [
					'edd_action' => $action,
					'license'    => sanitize_text_field( $license ),
					'item_id'    => (int) $cfg['item_id'],
					'url'        => home_url(),
				],
			] );

			if ( is_wp_error( $resp ) ) {
				return new \WP_Error( 'edd_http', $resp->get_error_message() );
			}
			if ( 200 !== (int) wp_remote_retrieve_response_code( $resp ) ) {
				return new \WP_Error( 'edd_http', __( 'Unexpected response from the license server.', 'filebird' ) );
			}

			$data = json_decode( wp_remote_retrieve_body( $resp ), true );
			if ( ! is_array( $data ) ) {
				return new \WP_Error( 'edd_parse', __( 'Invalid response from the license server.', 'filebird' ) );
			}
			return $data;
		}

		public function activate( array $cfg, $license ) {
			$license = sanitize_text_field( $license ); // sanitize at the public entry point
			$data    = $this->request( $cfg, 'activate_license', $license );
			if ( is_wp_error( $data ) ) {
				return $data;
			}
			$norm = $this->parse_response( $data );
			// Strict: only a 'valid' license activates. Anything else (incl. expired) is a
			// failure — surface a friendly error and do NOT store the key (it stays retryable).
			if ( 'valid' !== $norm['status'] ) {
				return new \WP_Error( 'edd_' . sanitize_key( $norm['error'] ?: $norm['status'] ), $this->message_for( $norm, 'activate' ) );
			}
			$this->save_license( $cfg, $license, $norm['status'], $norm );
			return $norm;
		}

		public function deactivate( array $cfg ) {
			$data = $this->request( $cfg, 'deactivate_license' );
			// Clear locally regardless of remote outcome so the user can re-enter a key.
			$this->clear( $cfg );
			return is_wp_error( $data ) ? $data : $this->parse_response( $data );
		}

		public function check( array $cfg ) {
			$data = $this->request( $cfg, 'check_license' );
			if ( is_wp_error( $data ) ) {
				return $data;
			}
			$norm = $this->parse_response( $data );
			// Refresh always syncs local state to the store's truth so the gate reflects reality.
			$this->save_license( $cfg, $this->get_key( $cfg ), $norm['status'], $norm );
			if ( in_array( $norm['status'], [ 'valid', 'expired' ], true ) ) {
				return $norm; // usable
			}
			// Persisted above so the gate blocks; also surface why.
			return new \WP_Error( 'edd_' . sanitize_key( $norm['error'] ?: $norm['status'] ), $this->message_for( $norm, 'check' ) );
		}

		/**
		 * Returns the RAW decoded EDD get_version payload (new_version, package, sections, ...).
		 * Intentionally NOT normalized — the Phase 5 updater (EDD_SL_Plugin_Updater) needs the raw shape.
		 */
		public function get_version( array $cfg ) {
			return $this->request( $cfg, 'get_version' );
		}

		/**
		 * Normalize an EDD response. Defensive: missing fields fall back to safe defaults.
		 */
		public function parse_response( array $d ) {
			return [
				'success'          => isset( $d['success'] ) ? (bool) $d['success'] : false,
				'status'           => isset( $d['license'] ) ? sanitize_text_field( $d['license'] ) : 'invalid',
				'expires'          => isset( $d['expires'] ) ? sanitize_text_field( $d['expires'] ) : '',
				'activations_left' => isset( $d['activations_left'] ) ? $this->int_or_null( $d['activations_left'] ) : null,
				'license_limit'    => isset( $d['license_limit'] ) ? $this->int_or_null( $d['license_limit'] ) : null,
				'item_name'        => isset( $d['item_name'] ) ? sanitize_text_field( $d['item_name'] ) : '',
				'error'            => isset( $d['error'] ) ? sanitize_text_field( $d['error'] ) : '',
			];
		}

		private function int_or_null( $v ) {
			return is_numeric( $v ) ? (int) $v : null; // EDD may send "unlimited" for unlimited seats.
		}

		/**
		 * Map an EDD failure (error code, else license status) to a user-facing message.
		 *
		 * @param array  $norm    Normalized response (uses 'error' then 'status').
		 * @param string $context 'activate' or 'check' — only changes the 'expired' wording.
		 */
		private function message_for( array $norm, $context = 'activate' ) {
			$code = '' !== $norm['error'] ? $norm['error'] : $norm['status'];

			if ( 'expired' === $code ) {
				return 'activate' === $context
					? __( 'This license key has expired. Please renew it before activating.', 'filebird' )
					: __( 'This license key has expired. Renew it to receive updates.', 'filebird' );
			}

			$map = [
				'missing'             => __( 'That license key was not found. Please check it and try again.', 'filebird' ),
				'missing_url'         => __( 'The site URL was missing from the request. Please try again.', 'filebird' ),
				'invalid'             => __( 'This license key is invalid.', 'filebird' ),
				'disabled'            => __( 'This license key has been disabled.', 'filebird' ),
				'revoked'             => __( 'This license key has been revoked.', 'filebird' ),
				'no_activations_left' => __( 'This license has no activations left. Deactivate another site or upgrade your plan.', 'filebird' ),
				'item_name_mismatch'  => __( 'This license key is for a different product.', 'filebird' ),
				'license_mismatch'    => __( 'This license key is for a different product.', 'filebird' ),
				'key_mismatch'        => __( 'This license key does not match this product.', 'filebird' ),
				'site_inactive'       => __( 'This license is not active for this site.', 'filebird' ),
				'inactive'            => __( 'This license is not active for this site.', 'filebird' ),
			];

			return isset( $map[ $code ] ) ? $map[ $code ] : __( 'Could not verify the license key. Please try again.', 'filebird' );
		}

		// ---- option storage ---------------------------------------------------
		private function key_name( $cfg )    { return $cfg['option_prefix'] . '_license_key'; }
		private function status_name( $cfg ) { return $cfg['option_prefix'] . '_license_status'; }
		private function data_name( $cfg )   { return $cfg['option_prefix'] . '_license_data'; }

		public function get_key( $cfg )    { return (string) get_option( $this->key_name( $cfg ), '' ); }
		public function get_status( $cfg ) { return (string) get_option( $this->status_name( $cfg ), '' ); }
		public function get_data( $cfg )   { return (array) get_option( $this->data_name( $cfg ), [] ); }

		public function save_license( $cfg, $key, $status, $data ) {
			update_option( $this->key_name( $cfg ), sanitize_text_field( $key ) );
			update_option( $this->status_name( $cfg ), sanitize_text_field( $status ) );
			update_option( $this->data_name( $cfg ), (array) $data );
		}

		public function clear( $cfg ) {
			// Key + data are removed; status is kept as an explicit 'invalid' so callers
			// never have to distinguish "missing option" from "not licensed".
			delete_option( $this->key_name( $cfg ) );
			update_option( $this->status_name( $cfg ), 'invalid' );
			delete_option( $this->data_name( $cfg ) );
		}
	}
}
