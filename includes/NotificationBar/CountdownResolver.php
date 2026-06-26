<?php
/**
 * CountdownResolver — resolve fixed-date countdowns to an absolute epoch (Pro).
 *
 * Runs right before bars are inlined into the page. For each enabled `date`-type
 * countdown it converts the stored `endAt` datetime-local string — interpreted
 * in the WordPress site timezone — into an absolute Unix-ms epoch and writes it
 * to `countdown.endEpoch`. The frontend ticker counts to that instant, so every
 * visitor sees the same remaining time regardless of their browser timezone.
 *
 * Evergreen countdowns are left untouched (the client seeds a per-visitor window
 * from `countdown.duration`). Pro-only: in Lite nothing renders a countdown, so
 * the whole pass is skipped via the NJT_NOFI_IS_PRO gate. The added `endEpoch`
 * lives only on the inlined copy of the bars — it is never persisted to the DB.
 *
 * @package NjtNotificationBar\NotificationBar
 * @since   3.2.0
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

/**
 * Class CountdownResolver
 */
class CountdownResolver {

	/**
	 * Resolve fixed-date countdown targets to absolute epochs, in place.
	 *
	 * @param  array $bars Bars (after dynamic-content resolution).
	 * @return array Bars with `countdown.endEpoch` set on enabled date timers.
	 */
	public static function apply( array $bars ): array {
		if ( ! ( defined( 'NJT_NOFI_IS_PRO' ) && NJT_NOFI_IS_PRO ) ) {
			return $bars;
		}

		$tz = function_exists( 'wp_timezone' ) ? wp_timezone() : new \DateTimeZone( 'UTC' );

		foreach ( $bars as &$bar ) {
			if ( ! is_array( $bar ) || empty( $bar['countdown'] ) || ! is_array( $bar['countdown'] ) ) {
				continue;
			}

			$cd = $bar['countdown'];

			// Only enabled, fixed-date timers. Missing type defaults to 'date'.
			if ( empty( $cd['enabled'] ) || ( isset( $cd['type'] ) && 'date' !== $cd['type'] ) ) {
				continue;
			}

			$end_at = isset( $cd['endAt'] ) ? (string) $cd['endAt'] : '';
			if ( '' === $end_at ) {
				continue;
			}

			// Interpret the wall-clock datetime-local in the site timezone.
			// Round-trip the formatted value to reject invalid calendar dates
			// (e.g. 02-30) that createFromFormat silently rolls forward instead
			// of returning false — otherwise the target could drift by days.
			$dt = \DateTimeImmutable::createFromFormat( 'Y-m-d\TH:i', $end_at, $tz );
			if ( false === $dt || $dt->format( 'Y-m-d\TH:i' ) !== $end_at ) {
				continue;
			}

			// Unix seconds → milliseconds for the JS Date-based ticker.
			$bar['countdown']['endEpoch'] = $dt->getTimestamp() * 1000;
		}
		unset( $bar );

		return $bars;
	}

	/**
	 * Localized countdown labels for the active language.
	 *
	 * The client renderer (render-bar.js) is vanilla JS with no i18n, so the unit
	 * labels and accessible name are translated here — under the `notibar`
	 * textdomain, which WPML/Polylang switch per request — and inlined into
	 * window.njtNotibarData for the renderer to read (it falls back to English
	 * when absent). `cdUnits` = full labels (boxes/flip/circular); `cdUnitsShort`
	 * = compact labels (text style).
	 *
	 * @return array{cdUnits:array,cdUnitsShort:array,cdAria:string}
	 */
	public static function labels(): array {
		return [
			'cdUnits'      => [
				'days'    => __( 'Days', 'notibar' ),
				'hours'   => __( 'Hours', 'notibar' ),
				'minutes' => __( 'Minutes', 'notibar' ),
				'seconds' => __( 'Seconds', 'notibar' ),
			],
			'cdUnitsShort' => [
				'days'    => __( 'days', 'notibar' ),
				'hours'   => __( 'hrs', 'notibar' ),
				'minutes' => __( 'mins', 'notibar' ),
				'seconds' => __( 'secs', 'notibar' ),
			],
			'cdAria'       => __( 'Countdown timer', 'notibar' ),
		];
	}
}
