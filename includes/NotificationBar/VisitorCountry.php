<?php
/**
 * VisitorCountry — resolve the current visitor's country (ISO 3166-1 alpha-2).
 *
 * Pro-only. Powers the per-bar "Country" display gate (filterByCountry in
 * NotificationBarHandle). Stripped from the Lite build via pro-manifest.json
 * "remove"; every caller sits inside @pro/@endpro markers so Lite never
 * references this class.
 *
 * Detection chain (first non-empty wins):
 *   1. Manual override — `njt_nofi_visitor_country` filter.
 *   2. WooCommerce — WC_Geolocation::geolocate_ip() when active (free; reuses
 *      WC's MaxMind database + WC's own per-IP transient cache, so we never
 *      double-call an external API on WC sites).
 *   3. Own fallback (WC absent) — request headers (CDN/host country), then a
 *      free IP API (ipinfo.io / ip-api.com, the same services WooCommerce uses),
 *      cached per-IP in a transient.
 *
 * Caching caveat: under full-page caching, anonymous cached HTML reflects the
 * country of whoever built the cache (the gate runs in PHP, which a page cache
 * bypasses). Same limitation as the Audience gate. Geo-targeted sites should
 * vary/exclude the cache by country.
 *
 * @package NjtNotificationBar\NotificationBar
 * @since   3.2.0
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

/**
 * Class VisitorCountry
 */
class VisitorCountry {

	/** Transient key prefix for the own-fallback per-IP API cache. */
	const TRANSIENT_PREFIX = 'njt_nofi_geoip_';

	/** Positive-result cache lifetime (resolved country). */
	const CACHE_TTL = WEEK_IN_SECONDS;

	/** Negative-result cache lifetime (unresolved) — short, so a flaky API
	 * is retried sooner without hammering it on every request. */
	const NEG_CACHE_TTL = HOUR_IN_SECONDS;

	/** @var string|null Request-level memo so repeated gate calls resolve once. */
	private static $memo = null;

	/**
	 * Visitor country as an uppercase ISO 3166-1 alpha-2 code, or '' if unknown.
	 *
	 * Memoised per request — safe to call once per bar.
	 *
	 * @return string
	 */
	public static function get(): string {
		if ( null === self::$memo ) {
			self::$memo = self::resolve();
		}
		return self::$memo;
	}

	/**
	 * Run the detection chain.
	 *
	 * @return string ISO-2 code or ''.
	 */
	private static function resolve(): string {
		$ip = self::ipAddress();

		// 1. Manual override (e.g. a CDN edge value or a test harness).
		$override = apply_filters( 'njt_nofi_visitor_country', null, $ip );
		if ( is_string( $override ) && '' !== $override ) {
			return self::normalize( $override );
		}

		// 2. Reuse WooCommerce geolocation when present. $fallback is left at
		// its default (false): with $fallback=true WC would geolocate the
		// SERVER's public IP whenever REMOTE_ADDR is private/local — wrong
		// country for every visitor, plus an extra outbound call. We'd rather
		// return '' (unknown) than the server's location.
		if ( class_exists( '\WC_Geolocation' ) ) {
			$geo = \WC_Geolocation::geolocate_ip( '' );
			if ( is_array( $geo ) && ! empty( $geo['country'] ) ) {
				$code = self::normalize( $geo['country'] );
				if ( '' !== $code ) {
					return $code;
				}
			}
		}

		// 3. Own fallback — headers first (no network), then free API.
		$code = self::fromHeaders();
		if ( '' !== $code ) {
			return $code;
		}

		if ( '' !== $ip ) {
			$code = self::fromApi( $ip );
			if ( '' !== $code ) {
				return $code;
			}
		}

		return '';
	}

	/**
	 * Resolve the client IP. Prefer WC's resolver (handles proxy /
	 * X-Forwarded-For); otherwise fall back to REMOTE_ADDR.
	 *
	 * @return string Validated IP, or '' when none.
	 */
	private static function ipAddress(): string {
		if ( class_exists( '\WC_Geolocation' ) && method_exists( '\WC_Geolocation', 'get_ip_address' ) ) {
			$ip = (string) \WC_Geolocation::get_ip_address();
		} else {
			$ip = isset( $_SERVER['REMOTE_ADDR'] )
				? (string) wp_unslash( $_SERVER['REMOTE_ADDR'] )
				: '';
		}

		return filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : '';
	}

	/**
	 * Country code from request headers set by a CDN/host (Cloudflare, etc.).
	 * Mirrors WC_Geolocation::get_country_code_from_headers().
	 *
	 * @return string ISO-2 or ''.
	 */
	private static function fromHeaders(): string {
		$headers = [
			'MM_COUNTRY_CODE',
			'GEOIP_COUNTRY_CODE',
			'HTTP_CF_IPCOUNTRY',
			'HTTP_X_COUNTRY_CODE',
		];

		foreach ( $headers as $header ) {
			if ( empty( $_SERVER[ $header ] ) ) {
				continue;
			}
			$code = self::normalize( sanitize_text_field( wp_unslash( $_SERVER[ $header ] ) ) );
			if ( '' !== $code ) {
				return $code;
			}
		}

		return '';
	}

	/**
	 * Country code via a free IP geolocation API, cached per-IP in a transient.
	 *
	 * Endpoints mirror WooCommerce's free fallback services and are filterable
	 * via `njt_nofi_geoip_apis` (service-slug => endpoint with one %s for the IP).
	 *
	 * @param  string $ip Validated IP.
	 * @return string ISO-2 or ''.
	 */
	private static function fromApi( string $ip ): string {
		$key    = self::TRANSIENT_PREFIX . md5( $ip );
		$cached = get_transient( $key );
		if ( false !== $cached ) {
			// '' is a valid (negative) cache hit; only false means "not cached".
			return is_string( $cached ) ? $cached : '';
		}

		$services = apply_filters(
			'njt_nofi_geoip_apis',
			[
				'ipinfo.io'  => 'https://ipinfo.io/%s/json',
				'ip-api.com' => 'http://ip-api.com/json/%s',
			]
		);

		$country = '';
		foreach ( (array) $services as $name => $endpoint ) {
			$response = wp_safe_remote_get(
				sprintf( $endpoint, $ip ),
				[
					'timeout'    => 2,
					'user-agent' => 'Notibar/' . NJT_NOFI_VERSION,
				]
			);

			if ( is_wp_error( $response ) ) {
				continue;
			}

			$body = wp_remote_retrieve_body( $response );
			if ( '' === $body ) {
				continue;
			}

			$data = json_decode( $body );
			if ( 'ip-api.com' === $name ) {
				$raw = isset( $data->countryCode ) ? $data->countryCode : '';
			} else {
				// ipinfo.io and any custom service returning { "country": "XX" }.
				$raw = isset( $data->country ) ? $data->country : '';
			}

			$country = self::normalize( $raw );
			if ( '' !== $country ) {
				break;
			}
		}

		// Cache positive for a week, negative (unresolved) for a short window.
		set_transient( $key, $country, '' !== $country ? self::CACHE_TTL : self::NEG_CACHE_TTL );

		return $country;
	}

	/**
	 * Normalise any raw value to an uppercase ISO 3166-1 alpha-2 code, or ''.
	 *
	 * @param  mixed $code Raw code.
	 * @return string
	 */
	private static function normalize( $code ): string {
		$code = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $code ) );
		return 1 === preg_match( '/^[A-Z]{2}$/', $code ) ? $code : '';
	}
}
