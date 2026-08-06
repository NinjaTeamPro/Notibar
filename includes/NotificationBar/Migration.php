<?php
/**
 * Migration — one-shot v2.1.9 → v3.0 data migration.
 *
 * Converts ~30 flat njt_nofi_* theme_mods into one bar object stored under
 * the njt_nofi_bars theme_mod and a global config under njt_nofi_global.
 *
 * Safety guarantees:
 *   - Idempotent via add_option(FLAG, 1) atomic-add lock.
 *   - Backup stored in wp_options (NOT a theme_mod) → survives theme switches.
 *   - Backup auto-pruned after 30 days via wp_schedule_single_event.
 *   - Legacy keys removed only AFTER new keys are committed.
 *
 * Value-mapping helpers live in MigrationMapper trait (keeps this file <200 LOC).
 *
 * @package NjtNotificationBar\NotificationBar
 * @since   3.0.0
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

require_once __DIR__ . '/MigrationMapper.php';
require_once __DIR__ . '/Schema.php';

/**
 * Class Migration
 */
class Migration {

	use MigrationMapper;

	// ------------------------------------------------------------------
	// Constants
	// ------------------------------------------------------------------

	const FLAG                    = 'njt_nofi_migrated_to_v3';
	const FLAG_OPTIONS_MIGRATION  = 'njt_nofi_migrated_to_options';
	const FLAG_CPT_LOGIC_BACKFILL = 'njt_nofi_cpt_logic_backfilled';
	const BACKUP_OPTION           = 'njt_nofi_v2_backup';
	const PRUNE_HOOK              = 'njt_nofi_prune_v2_backup';

	/** All legacy theme_mod keys owned by v2.1.9. */
	const LEGACY_KEYS = [
		'njt_nofi_enable_bar',         'njt_nofi_text',
		'njt_nofi_text_mobile',        'njt_nofi_content_mobile',
		'njt_nofi_handle_button',      'njt_nofi_lb_text',
		'njt_nofi_lb_url',             'njt_nofi_lb_font_weight',
		'njt_nofi_open_new_windown',   'njt_nofi_handle_button_mobile',
		'njt_nofi_lb_text_mobile',     'njt_nofi_lb_url_mobile',
		'njt_nofi_lb_font_weight_mobile', 'njt_nofi_open_new_windown_mobile',
		'njt_nofi_bg_color',           'njt_nofi_text_color',
		'njt_nofi_lb_color',           'njt_nofi_lb_text_color',
		'njt_nofi_font_size',          'njt_nofi_alignment',
		'njt_nofi_content_width',      'njt_nofi_position_type',
		'njt_nofi_devices_display',    'njt_nofi_logic_display_page',
		'njt_nofi_list_display_page',  'njt_nofi_logic_display_post',
		'njt_nofi_list_display_post',  'njt_nofi_hide_close_button',
		'njt_nofi_open_after_day',     'njt_nofi_preset_color',
	];

	// ------------------------------------------------------------------
	// Singleton
	// ------------------------------------------------------------------

	/** @var Migration|null */
	private static $instance = null;

	/** @return Migration */
	public static function getInstance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/** Registers cron and admin-notice hooks. */
	private function __construct() {
		add_action( self::PRUNE_HOOK, [ $this, 'prune' ] );
		add_action( 'admin_notices', [ $this, 'showMigrationNotice' ] );
		add_action( 'wp_ajax_njt_nofi_dismiss_migration_notice', [ $this, 'dismissMigrationNotice' ] );
	}

	// ------------------------------------------------------------------
	// Public API
	// ------------------------------------------------------------------

	/**
	 * Entry point — called on plugins_loaded (priority 5, before main init).
	 *
	 * Short-circuits if FLAG already set or if v3 data already exists.
	 * Uses add_option() atomic-add as an idempotency lock.
	 *
	 * @return void
	 */
	public function maybeRun(): void {
		if ( get_option( self::FLAG ) ) {
			return;
		}
		// v3 data already present (in either v3.0/3.1 theme_mod storage OR
		// v3.1.2+ wp_options storage) = clean install or previous partial run.
		if ( '' !== get_theme_mod( 'njt_nofi_bars', '' ) ) {
			if ( ! get_option( self::FLAG ) ) {
				add_option( self::FLAG, 1, '', false );
			}
			return;
		}
		if ( false !== get_option( 'njt_nofi_bars', false ) ) {
			return;
		}
		// Atomic lock — add_option returns false if option already exists.
		// autoload=false (boolean — string 'no' deprecated since WP 6.6).
		if ( ! add_option( self::FLAG, 1, '', false ) ) {
			return;
		}
		try {
			$this->runMigration();
		} catch ( \Throwable $e ) {
			// Release lock so a subsequent page load can retry.
			delete_option( self::FLAG );
			throw $e;
		}
	}

	/**
	 * v3.1.2 — copy the active theme's bars + global theme_mod values into
	 * wp_options on first load after upgrade. Required because v3.1.2 flipped
	 * the Customizer setting type from `theme_mod` → `option`, otherwise
	 * existing users would see empty settings after the version bump.
	 *
	 * Idempotent + concurrent-safe via `add_option(FLAG, 1)` atomic-add lock
	 * (same pattern as maybeRun above). Theme_mod copies are LEFT IN PLACE
	 * as a rollback path (per locked decision D3).
	 *
	 * ORDERING: this method MUST run AFTER maybeRun() within the same
	 * plugins_loaded closure so v2→v3 data lands in theme_mod first and is
	 * then copied to options here. Wired correctly in njt-notification-bar.php.
	 *
	 * @return void
	 */
	public function maybeMigrateThemeModToOption(): void {
		$this->maybeSelfHealOptionsMigration();

		$option_bars_raw = get_option( 'njt_nofi_bars', false );
		$option_bars_str = is_string( $option_bars_raw ) ? $option_bars_raw : '';

		if ( get_option( self::FLAG_OPTIONS_MIGRATION ) && $this->hasUsableBarsJson( $option_bars_str ) ) {
			return;
		}

		$bars   = $this->resolveBarsThemeMod();
		$global = $this->resolveGlobalThemeMod();

		// Defer — do not lock FLAG_OPTIONS while v2→v3 is still writing theme_mod
		// on a concurrent request (FLAG may be set before set_theme_mod completes).
		if ( '' === $bars && '' === $global ) {
			return;
		}

		$this->ensureV3Flag();

		if ( ! get_option( self::FLAG ) ) {
			return;
		}

		$needs_bars   = $this->optionNeedsBarsCopy( $bars );
		$needs_global = $this->optionNeedsGlobalCopy( $global );

		if ( ! $needs_bars && ! $needs_global ) {
			if ( $this->hasUsableBarsJson( $option_bars_str ) ) {
				$this->markOptionsMigrationComplete();
			}
			return;
		}

		if ( $needs_bars ) {
			$this->persistBarsOption( $bars );
		}
		if ( $needs_global ) {
			$this->persistGlobalOption( $global );
		}

		$this->markOptionsMigrationComplete();
	}

	/**
	 * v3.2 — backfill cptLogic on bars saved before v3.1.0 introduced CPT
	 * targeting. Those bars have no 'cptLogic' key at all; without this,
	 * filter-bars.js's `display.cptLogic || 'none'` fallback silently hides
	 * them on every custom-post-type single page after upgrading.
	 *
	 * Mirrors MigrationMapper's pageLogic → cptLogic rule (all→all, none→none;
	 * include/exclude left untouched — no CPT-level equivalent to infer).
	 *
	 * Checks both storage locations directly rather than gating on
	 * FLAG_OPTIONS_MIGRATION: that migration only runs for sites that came
	 * through the v2→v3 legacy path, so a native v3.0.0–v3.1.1 install (no
	 * v2 history) may still have its bars sitting in theme_mod only.
	 *
	 * Idempotent + concurrent-safe via the same add_option() atomic-add lock
	 * pattern as the migration steps above.
	 *
	 * @return void
	 */
	public function maybeBackfillCptLogic(): void {
		if ( get_option( self::FLAG_CPT_LOGIC_BACKFILL ) ) {
			return;
		}
		if ( ! add_option( self::FLAG_CPT_LOGIC_BACKFILL, 1, '', false ) ) {
			return;
		}

		$this->backfillCptLogicInOption();
		$this->backfillCptLogicInThemeMod();
	}

	/** Backfill cptLogic on bars stored in the njt_nofi_bars OPTION. */
	private function backfillCptLogicInOption(): void {
		$raw = get_option( 'njt_nofi_bars', false );
		if ( false === $raw ) {
			return;
		}
		$bars = json_decode( (string) $raw, true );
		if ( ! is_array( $bars ) ) {
			return;
		}
		if ( $this->backfillCptLogicInBars( $bars ) ) {
			update_option( 'njt_nofi_bars', wp_json_encode( $bars ) );
		}
	}

	/** Backfill cptLogic on bars stored in the njt_nofi_bars THEME_MOD. */
	private function backfillCptLogicInThemeMod(): void {
		$raw = get_theme_mod( 'njt_nofi_bars', '' );
		if ( '' === $raw ) {
			return;
		}
		$bars = json_decode( (string) $raw, true );
		if ( ! is_array( $bars ) ) {
			return;
		}
		if ( $this->backfillCptLogicInBars( $bars ) ) {
			set_theme_mod( 'njt_nofi_bars', wp_json_encode( $bars ) );
		}
	}

	/**
	 * Mutate $bars in place, seeding cptLogic on any bar missing the key.
	 *
	 * @param  array $bars Bars array, mutated by reference.
	 * @return bool        True if at least one bar changed.
	 */
	private function backfillCptLogicInBars( array &$bars ): bool {
		$changed = false;
		foreach ( $bars as &$bar ) {
			if ( ! is_array( $bar ) || ! isset( $bar['display'] ) || ! is_array( $bar['display'] ) ) {
				continue;
			}
			if ( array_key_exists( 'cptLogic', $bar['display'] ) ) {
				continue;
			}
			$page_logic = $bar['display']['pageLogic'] ?? 'all';
			if ( 'all' === $page_logic ) {
				$bar['display']['cptLogic'] = 'all';
				$changed = true;
			} elseif ( 'none' === $page_logic ) {
				$bar['display']['cptLogic'] = 'none';
				$changed = true;
			}
		}
		unset( $bar );
		return $changed;
	}

	/** Cron callback — deletes the backup option after 30 days. */
	public function prune(): void {
		delete_option( self::BACKUP_OPTION );
	}

	/**
	 * Show a dismissible admin notice once after migration completes.
	 * Dismissal stored in user meta so it doesn't re-appear.
	 *
	 * @return void
	 */
	public function showMigrationNotice(): void {
		if ( ! get_option( self::FLAG ) ) {
			return;
		}
		$backup = get_option( self::BACKUP_OPTION );
		if ( ! $backup ) {
			return;
		}
		// Defense for installs that ran the OLD snapshotLegacy (pre-fix),
		// which wrote a backup even when all legacy keys were absent. If
		// the persisted backup's theme_mods are all `false`, the store
		// never actually used v2 — suppress the notice.
		if ( is_array( $backup ) && isset( $backup['theme_mods'] ) && is_array( $backup['theme_mods'] ) ) {
			$has_real_data = false;
			foreach ( $backup['theme_mods'] as $v ) {
				if ( false !== $v ) {
					$has_real_data = true;
					break;
				}
			}
			if ( ! $has_real_data ) {
				return;
			}
		}

		$user_id = get_current_user_id();
		if ( ! $user_id
			|| ! current_user_can( 'manage_options' )
			|| get_user_meta( $user_id, 'njt_nofi_migration_notice_dismissed', true )
		) {
			return;
		}
		$nonce = wp_create_nonce( 'njt_nofi_dismiss_migration_notice' );
		?>
		<div class="notice notice-info is-dismissible" id="njt-nofi-migration-notice">
			<p><?php
				echo wp_kses_post( sprintf(
					/* translators: %s: wp_options key name */
					__( '<strong>Notibar v3</strong> migrated your settings. A backup is kept for 30 days (option: <code>%s</code>).', 'notibar' ),
					esc_html( self::BACKUP_OPTION )
				) );
			?></p>
		</div>
		<script>
		(function(){
			if ( ! window.jQuery ) {
				return;
			}
			window.jQuery(document).on('click', '#njt-nofi-migration-notice .notice-dismiss', function(){
				fetch(ajaxurl,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},
					body:'action=njt_nofi_dismiss_migration_notice&nonce=<?php echo esc_js( $nonce ); ?>'});
				el.remove();
			});
		})();
		</script>
		<?php
	}

	/** AJAX handler — stores dismissal flag in user meta. */
	public function dismissMigrationNotice(): void {
		check_ajax_referer( 'njt_nofi_dismiss_migration_notice', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( null, 403 );
		}
		$uid = get_current_user_id();
		if ( $uid ) {
			update_user_meta( $uid, 'njt_nofi_migration_notice_dismissed', 1 );
		}
		wp_send_json_success();
	}

	// ------------------------------------------------------------------
	// Private migration steps
	// ------------------------------------------------------------------

	/** Orchestrates the full migration sequence. */
	private function runMigration(): void {
		$legacy = $this->snapshotLegacy();
		$bar    = $this->buildBarFromLegacy( $legacy );
		$global = Schema::defaultGlobal();

		set_theme_mod( 'njt_nofi_bars',   wp_json_encode( [ $bar ] ) );
		set_theme_mod( 'njt_nofi_global', wp_json_encode( $global ) );

		$this->deleteLegacyKeys( self::LEGACY_KEYS );
		$this->schedulePrune();
	}

	/**
	 * Read all legacy theme_mod keys, persist backup, return snapshot.
	 *
	 * @return array Map of legacy_key => value (false when not set).
	 */
	private function snapshotLegacy(): array {
		// Use raw get_theme_mods() so we can distinguish "key was set" from
		// "key returns its default" — a fresh install where v2 was never
		// touched has zero of these keys present.
		$all_mods = get_theme_mods();
		if ( ! is_array( $all_mods ) ) {
			$all_mods = [];
		}

		$legacy   = [];
		$has_data = false;
		foreach ( self::LEGACY_KEYS as $key ) {
			if ( array_key_exists( $key, $all_mods ) ) {
				$legacy[ $key ] = $all_mods[ $key ];
				$has_data       = true;
			} else {
				$legacy[ $key ] = false;
			}
		}

		// Only persist the backup option (and trigger the post-migration
		// admin notice) when at least one legacy theme_mod actually existed.
		// Fresh installs that never used v2 skip both — no false-positive
		// "Notibar v3 migrated your settings" notice on brand new stores.
		if ( $has_data ) {
			// autoload=false — backup is large, only read on demand.
			update_option( self::BACKUP_OPTION, [ 'migrated_at' => time(), 'theme_mods' => $legacy ], false );
		}
		return $legacy;
	}

	/**
	 * Build a v3 bar from the legacy snapshot using MigrationMapper helpers.
	 *
	 * @param  array $l Legacy snapshot.
	 * @return array    Sanitized v3 bar.
	 */
	private function buildBarFromLegacy( array $l ): array {
		$bar = Schema::defaultBar();

		if ( false !== $l['njt_nofi_enable_bar'] ) {
			$bar['enabled'] = (bool) $l['njt_nofi_enable_bar'];
		}

		$this->applyContentMapping( $bar, $l );
		$this->applyStyleMapping( $bar, $l );
		$this->applyDisplayMapping( $bar, $l );
		$this->applyBehaviorMapping( $bar, $l );
		// njt_nofi_preset_color is intentionally discarded (colors already migrated).

		return $bar;
	}

	/** Remove all legacy theme_mod keys. */
	private function deleteLegacyKeys( array $keys ): void {
		foreach ( $keys as $key ) {
			remove_theme_mod( $key );
		}
	}

	/** Schedule backup prune 30 days from now (once). */
	private function schedulePrune(): void {
		if ( ! wp_next_scheduled( self::PRUNE_HOOK ) ) {
			wp_schedule_single_event( time() + ( 30 * DAY_IN_SECONDS ), self::PRUNE_HOOK );
		}
	}

	// ------------------------------------------------------------------
	// v3.1.2 theme_mod → option helpers
	// ------------------------------------------------------------------

	/**
	 * Clear a wrongly-locked FLAG_OPTIONS when option is empty but theme_mod has data.
	 *
	 * @return void
	 */
	private function maybeSelfHealOptionsMigration(): void {
		if ( ! get_option( self::FLAG_OPTIONS_MIGRATION ) ) {
			return;
		}

		$option_bars = get_option( 'njt_nofi_bars', false );
		if ( $this->hasUsableBarsJson( is_string( $option_bars ) ? $option_bars : '' ) ) {
			return;
		}

		$theme_bars = $this->resolveBarsThemeMod();
		if ( '' !== $theme_bars && $this->hasUsableBarsJson( $theme_bars ) ) {
			delete_option( self::FLAG_OPTIONS_MIGRATION );
		}
	}

	/**
	 * @param string $raw JSON string.
	 * @return bool
	 */
	private function hasUsableBarsJson( string $raw ): bool {
		if ( '' === $raw ) {
			return false;
		}

		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) || empty( $decoded ) ) {
			return false;
		}

		foreach ( $decoded as $bar ) {
			if ( is_array( $bar ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * @param string $raw JSON string.
	 * @return bool
	 */
	private function hasUsableGlobalJson( string $raw ): bool {
		if ( '' === $raw ) {
			return false;
		}

		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) && ! empty( $decoded );
	}

	/**
	 * @param string $theme_mod_bars Bars JSON from theme_mod.
	 * @return bool
	 */
	private function optionNeedsBarsCopy( string $theme_mod_bars ): bool {
		if ( '' === $theme_mod_bars || ! $this->hasUsableBarsJson( $theme_mod_bars ) ) {
			return false;
		}

		$option_bars = get_option( 'njt_nofi_bars', false );
		if ( false === $option_bars || ! is_string( $option_bars ) ) {
			return true;
		}

		return ! $this->hasUsableBarsJson( $option_bars );
	}

	/**
	 * @param string $theme_mod_global Global JSON from theme_mod.
	 * @return bool
	 */
	private function optionNeedsGlobalCopy( string $theme_mod_global ): bool {
		if ( '' === $theme_mod_global || ! $this->hasUsableGlobalJson( $theme_mod_global ) ) {
			return false;
		}

		$option_global = get_option( 'njt_nofi_global', false );
		if ( false === $option_global || ! is_string( $option_global ) ) {
			return true;
		}

		return ! $this->hasUsableGlobalJson( $option_global );
	}

	/**
	 * Active theme_mod first; scan other themes' theme_mods_* blobs when empty.
	 *
	 * @return string JSON string or empty.
	 */
	private function resolveBarsThemeMod(): string {
		$bars = (string) get_theme_mod( 'njt_nofi_bars', '' );
		if ( '' !== $bars && $this->hasUsableBarsJson( $bars ) ) {
			return $bars;
		}

		return $this->findThemeModValueInInstalledThemes( 'njt_nofi_bars' );
	}

	/**
	 * Active theme_mod first; scan other themes' theme_mods_* blobs when empty.
	 *
	 * @return string JSON string or empty.
	 */
	private function resolveGlobalThemeMod(): string {
		$global = (string) get_theme_mod( 'njt_nofi_global', '' );
		if ( '' !== $global && $this->hasUsableGlobalJson( $global ) ) {
			return $global;
		}

		return $this->findThemeModValueInInstalledThemes( 'njt_nofi_global' );
	}

	/**
	 * Search theme_mods_{stylesheet} options for a Notibar key.
	 *
	 * @param string $key njt_nofi_bars or njt_nofi_global.
	 * @return string
	 */
	private function findThemeModValueInInstalledThemes( string $key ): string {
		global $wpdb;

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT option_value FROM {$wpdb->options} WHERE option_name LIKE %s",
				$wpdb->esc_like( 'theme_mods_' ) . '%'
			)
		);

		if ( ! is_array( $rows ) ) {
			return '';
		}

		foreach ( $rows as $row ) {
			if ( ! isset( $row->option_value ) ) {
				continue;
			}

			$mods = maybe_unserialize( $row->option_value );
			if ( ! is_array( $mods ) || ! isset( $mods[ $key ] ) ) {
				continue;
			}

			$val = $mods[ $key ];
			if ( ! is_string( $val ) || '' === $val ) {
				continue;
			}

			if ( 'njt_nofi_bars' === $key && $this->hasUsableBarsJson( $val ) ) {
				return $val;
			}

			if ( 'njt_nofi_global' === $key && $this->hasUsableGlobalJson( $val ) ) {
				return $val;
			}
		}

		return '';
	}

	/**
	 * @param string $bars JSON bars string.
	 * @return void
	 */
	private function persistBarsOption( string $bars ): void {
		if ( false !== get_option( 'njt_nofi_bars', false ) ) {
			update_option( 'njt_nofi_bars', $bars, true );
			return;
		}

		add_option( 'njt_nofi_bars', $bars, '', true );
	}

	/**
	 * @param string $global JSON global string.
	 * @return void
	 */
	private function persistGlobalOption( string $global ): void {
		if ( false !== get_option( 'njt_nofi_global', false ) ) {
			update_option( 'njt_nofi_global', $global, true );
			return;
		}

		add_option( 'njt_nofi_global', $global, '', true );
	}

	/**
	 * @return void
	 */
	private function markOptionsMigrationComplete(): void {
		if ( ! get_option( self::FLAG_OPTIONS_MIGRATION ) ) {
			add_option( self::FLAG_OPTIONS_MIGRATION, 1, '', false );
		}
	}

	/**
	 * @return void
	 */
	private function ensureV3Flag(): void {
		if ( ! get_option( self::FLAG ) ) {
			add_option( self::FLAG, 1, '', false );
		}
	}
}
