<?php
/**
 * Per-bar event counter store.
 *
 * Storage: single wp_options row `notibar_counters` (autoload=no).
 * Schema:  { "<bar_id>": { "clicks": N, "dismissals": M }, ... }
 *
 * Race-safety: increment() runs ONE atomic UPDATE with JSON_SET +
 * IFNULL(JSON_EXTRACT, 0) + 1. MySQL serializes single-statement
 * UPDATEs on the same row, so 10 concurrent POSTs => count = 10.
 *
 * @package NjtNotificationBar\NotificationBar
 * @since   3.1.0
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

class EventCounter {

	/** @var string Option name. */
	const OPTION = 'notibar_counters';

	/** @var array<string,string> Event input => JSON key. Whitelist. */
	const EVENT_MAP = [
		'click'   => 'clicks',
		'dismiss' => 'dismissals',
		'engage'  => 'engagements',
	];

	/** @var string Strict bar_id format (UUID v4 + alnum/underscore fallback). */
	const BAR_ID_REGEX = '/^[a-zA-Z0-9_-]+$/';

	/** @var string Autoloaded boolean marker so maybeInstall() short-circuits free. */
	const INSTALL_MARKER = 'njt_nofi_counters_v';

	/**
	 * Seed the option row. Idempotent. Bails on MySQL/MariaDB < 5.7
	 * (no JSON_SET support) — counters silently stay zero on legacy DBs.
	 */
	public static function install(): void {
		global $wpdb;
		if ( version_compare( (string) $wpdb->db_version(), '5.7.0', '<' ) ) {
			error_log( 'Notibar: MySQL/MariaDB <5.7 detected — per-bar event tracking disabled.' );
			return;
		}
		add_option( self::OPTION, '{}', '', 'no' );
	}

	/**
	 * Self-healing install hook — safe to call on every load.
	 *
	 * Required for auto-upgrade paths (3.0 → 3.1) where register_activation_hook
	 * does NOT re-fire. The autoloaded marker option keeps the steady-state cost
	 * to one cache hit per request.
	 */
	public static function maybeInstall(): void {
		if ( '1' === get_option( self::INSTALL_MARKER ) ) {
			return;
		}
		self::install();
		update_option( self::INSTALL_MARKER, '1', true );
	}

	/**
	 * Atomically increment one counter.
	 *
	 * Uses JSON_MERGE_PATCH (deep-merge) instead of JSON_SET because JSON_SET
	 * does NOT auto-create intermediate parent objects — calling
	 * `JSON_SET('{}', '$."uuid".clicks', 1)` returns `{}` unchanged. The
	 * outer call to JSON_OBJECT constructs the nested patch `{ "<bar_id>":
	 * { "<json_key>": N+1 } }` which JSON_MERGE_PATCH then deep-merges into
	 * the option value, preserving sibling counters on the same bar.
	 *
	 * Race-safety: single-row UPDATE; MySQL serializes concurrent UPDATEs on
	 * the same row. References to option_value on the SET right-hand side
	 * resolve to the pre-update snapshot within one statement.
	 *
	 * @return bool true when one row updated, false otherwise.
	 */
	public static function increment( string $bar_id, string $event ): bool {
		if ( ! preg_match( self::BAR_ID_REGEX, $bar_id ) ) {
			return false;
		}
		if ( ! isset( self::EVENT_MAP[ $event ] ) ) {
			return false;
		}

		$json_key  = self::EVENT_MAP[ $event ];                       // whitelisted enum
		$read_path = '$."' . $bar_id . '".' . $json_key;              // inputs validated above

		global $wpdb;

		$sql = $wpdb->prepare(
			"UPDATE {$wpdb->options}
			 SET option_value = JSON_MERGE_PATCH(
			   IFNULL(NULLIF(option_value, ''), '{}'),
			   JSON_OBJECT(
			     %s,
			     JSON_OBJECT(
			       %s,
			       IFNULL(JSON_EXTRACT(IFNULL(NULLIF(option_value, ''), '{}'), %s), 0) + 1
			     )
			   )
			 )
			 WHERE option_name = %s",
			$bar_id,
			$json_key,
			$read_path,
			self::OPTION
		);

		$result = $wpdb->query( $sql );
		wp_cache_delete( self::OPTION, 'options' );
		return false !== $result && $result > 0;
	}

	/**
	 * Read counters for one bar. Missing => zeros. Caller is responsible for
	 * input validation (REST route regex already enforces BAR_ID_REGEX shape).
	 *
	 * @return array{clicks:int,dismissals:int,engagements:int}
	 */
	public static function read( string $bar_id ): array {
		$data = self::all();
		$row  = $data[ $bar_id ] ?? [];
		return [
			'clicks'      => isset( $row['clicks'] ) ? (int) $row['clicks'] : 0,
			'dismissals'  => isset( $row['dismissals'] ) ? (int) $row['dismissals'] : 0,
			'engagements' => isset( $row['engagements'] ) ? (int) $row['engagements'] : 0,
		];
	}

	/**
	 * Drop counter keys whose bar_id is not in the supplied valid set.
	 * Called by customize_save_after diff in plugin bootstrap.
	 *
	 * @param string[] $valid_bar_ids Bar IDs from current theme_mod njt_nofi_bars.
	 * @return int Number of orphan keys removed.
	 */
	public static function pruneAgainst( array $valid_bar_ids ): int {
		$data = self::all();
		if ( empty( $data ) ) {
			return 0;
		}

		$valid   = array_flip( $valid_bar_ids );
		$removed = 0;
		foreach ( array_keys( $data ) as $id ) {
			if ( ! isset( $valid[ $id ] ) ) {
				unset( $data[ $id ] );
				$removed++;
			}
		}

		if ( $removed > 0 ) {
			update_option( self::OPTION, wp_json_encode( $data ), false );
		}
		return $removed;
	}

	/**
	 * Decode the option as an assoc array. Tolerates legacy/corrupt values.
	 */
	private static function all(): array {
		$raw = get_option( self::OPTION, '{}' );
		if ( is_array( $raw ) ) {
			return $raw;
		}
		$data = json_decode( (string) $raw, true );
		return is_array( $data ) ? $data : [];
	}
}
