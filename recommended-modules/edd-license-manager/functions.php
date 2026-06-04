<?php

defined( 'ABSPATH' ) || exit;

/**
 * Public license-state helpers (global functions) for consumer plugins.
 *
 * Self-contained: they read the registration array ($njt_license_plugins) and the stored status
 * option DIRECTLY, so they work the instant this file loads (plugins_loaded:0) — with no dependency
 * on the module's boot/hooks. That is why a consumer can gate features during `plugins_loaded`.
 *
 * FAIL-OPEN: when the module is not bundled these functions don't exist, so callers MUST guard:
 *   if ( ! function_exists( 'njt_edd_license_usable' ) || njt_edd_license_usable( 'your-slug' ) ) {
 *       // licensed (valid|expired) OR module absent → allow
 *   }
 *
 * Consumers must register into $njt_license_plugins at FILE SCOPE (before plugins_loaded). PHP 7.1+.
 */

if ( ! function_exists( 'njt_edd_license_status' ) ) {
	/**
	 * Stored license status for a slug ('' if none): valid | expired | invalid | disabled | …
	 *
	 * @param string $slug Registered plugin slug.
	 * @return string
	 */
	function njt_edd_license_status( $slug ) {
		$slug   = sanitize_key( $slug );
		$prefix = $slug; // default option_prefix = sanitize_key(slug); matches normalize_config().
		if ( isset( $GLOBALS['njt_license_plugins'] ) && is_array( $GLOBALS['njt_license_plugins'] ) ) {
			foreach ( $GLOBALS['njt_license_plugins'] as $cfg ) {
				if ( ! empty( $cfg['slug'] ) && sanitize_key( $cfg['slug'] ) === $slug ) {
					// sanitize_key the explicit prefix to match normalize_config()'s write path.
					$prefix = ! empty( $cfg['option_prefix'] ) ? sanitize_key( $cfg['option_prefix'] ) : $slug;
					break;
				}
			}
		}
		return (string) get_option( $prefix . '_license_status', '' );
	}
}

if ( ! function_exists( 'njt_edd_license_status_usable' ) ) {
	/**
	 * EDD-standard usability rule (single source of truth): usable when valid or expired.
	 * Expired keeps features working; only updates stop (enforced store-side).
	 *
	 * @param string $status
	 * @return bool
	 */
	function njt_edd_license_status_usable( $status ) {
		return in_array( $status, [ 'valid', 'expired' ], true );
	}
}

if ( ! function_exists( 'njt_edd_license_usable' ) ) {
	/**
	 * Is the plugin's license usable (valid|expired)?
	 *
	 * @param string $slug Registered plugin slug.
	 * @return bool
	 */
	function njt_edd_license_usable( $slug ) {
		return njt_edd_license_status_usable( njt_edd_license_status( $slug ) );
	}
}
