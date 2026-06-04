<?php

defined( 'ABSPATH' ) || exit;

/**
 * EDD License Manager — orchestrator.
 *
 * Generic, config-driven engine: one loaded copy manages licenses for EVERY plugin that
 * registers itself in the global $njt_license_plugins array (mirrors the `review` module so
 * it survives the registry's "newest version wins" arbitration). For the registration array
 * shape, filter contract and consumer integration, see README.md → "EDD License Manager".
 */
if ( ! class_exists( 'NjtEddLicenseManagerMain' ) ) {
	class NjtEddLicenseManagerMain {

		const ASSET_VER = '1.10.0'; // asset cache-buster; bump with register.php
		private static $instance = null;

		/** @var bool Guards init() so hooks register exactly once. */
		private $booted = false;

		/** @var array<string, array> Registered configs keyed by slug. */
		private $plugins = [];

		/** @var NjtEddLicenseAdminPage|null */
		private $admin_page = null;

		/** @var NjtEddLicenseAjax|null */
		private $ajax = null;

		/** @var NjtEddLicenseApiClient|null */
		private $client = null;

		/** @var NjtEddLicenseUpdater|null */
		private $updater = null;

		/** @var NjtEddLicenseRowNotice|null */
		private $row_notice = null;

		/** @var NjtEddLicenseCron|null */
		private $cron = null;

		/** @var NjtEddLicenseGuard|null */
		private $guard = null;

		public static function get_instance() {
			if ( null === self::$instance ) {
				self::$instance = new self();
			}
			return self::$instance;
		}

		/** Register WordPress hooks. Idempotent — safe to call more than once. */
		public function init() {
			if ( $this->booted ) {
				return;
			}
			$this->booted = true;
			$this->do_hooks();
		}

		private function do_hooks() {
			global $njt_license_plugins;

			if ( ! isset( $njt_license_plugins ) || ! is_array( $njt_license_plugins ) ) {
				$njt_license_plugins = [];
			}

			if ( empty( $njt_license_plugins ) ) {
				return; // Nothing registered → no-op, no hooks.
			}

			foreach ( $njt_license_plugins as $cfg ) {
				$cfg = $this->normalize_config( $cfg );
				if ( null !== $cfg ) {
					$this->plugins[ $cfg['slug'] ] = $cfg;
				}
			}

			$this->client = new NjtEddLicenseApiClient();

			// Admin License submenu (one per registered plugin).
			$this->admin_page = new NjtEddLicenseAdminPage( $this->client );
			add_action( 'admin_menu', function () {
				$this->admin_page->register_menus( $this->plugins );
			} );

			// AJAX handlers + script enqueue on the license pages.
			$this->ajax = new NjtEddLicenseAjax( $this->client );
			$this->ajax->register();
			add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_assets' ] );

			// WP update integration (admin + cron) per registered plugin with a stored key.
			$this->updater = new NjtEddLicenseUpdater( $this->client, $this->plugins );
			$this->updater->register();

			// Plugins-list row notice (activate/renew prompt while not valid).
			$this->row_notice = new NjtEddLicenseRowNotice( $this->client, $this->plugins );
			$this->row_notice->register();

			// Daily background re-check so stored license status stays honest.
			$this->cron = new NjtEddLicenseCron( $this->client, $this->plugins );
			$this->cron->register();

			// Gating: consumers read license state via the global helpers in functions.php
			// (njt_edd_license_usable() / njt_edd_license_status()) — loaded at plugins_loaded:0.

			// Optional admin-page guard — only when a plugin opts in via 'gated_pages'.
			foreach ( $this->plugins as $cfg ) {
				if ( ! empty( $cfg['gated_pages'] ) ) {
					$this->guard = new NjtEddLicenseGuard( $this->client, $this->plugins );
					$this->guard->register();
					break;
				}
			}
		}

		/**
		 * Convenience helper: is the plugin's license usable (valid|expired)?
		 * Thin wrapper over the global njt_edd_license_usable() (the documented public API).
		 */
		public static function is_usable( $slug ) {
			return function_exists( 'njt_edd_license_usable' ) ? njt_edd_license_usable( $slug ) : false;
		}

		/** Enqueue the license script only on a registered plugin's License page. */
		public function enqueue_assets( $hook ) {
			$on_page = false;
			foreach ( $this->plugins as $cfg ) {
				if ( false !== strpos( (string) $hook, $cfg['option_prefix'] . '-license' ) ) {
					$on_page = true;
					break;
				}
			}
			if ( ! $on_page ) {
				return;
			}

			$url = plugin_dir_url( __FILE__ );
			wp_enqueue_style( 'njt-edd-license', $url . 'assets/css/admin.css', [ 'dashicons' ], self::ASSET_VER );
			wp_enqueue_script( 'njt-edd-license', $url . 'assets/js/script.js', [ 'jquery' ], self::ASSET_VER, true );
			wp_localize_script( 'njt-edd-license', 'njtEddLicense', [
				'ajaxurl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( NjtEddLicenseAjax::NONCE ),
				'i18n'    => [
					'processing' => __( 'Processing…', 'filebird' ),
					'failed'     => __( 'Request failed.', 'filebird' ),
					'latest'     => __( 'Latest version:', 'filebird' ),
					'upToDate'   => __( 'You are up to date.', 'filebird' ),
					'changelog'  => __( 'Changelog', 'filebird' ),
					'showKey'    => __( 'Show license key', 'filebird' ),
					'hideKey'    => __( 'Hide license key', 'filebird' ),
				],
			] );
		}

		/**
		 * Validate + fill defaults. Returns null for invalid registrations (silently skipped).
		 */
		private function normalize_config( $cfg ) {
			if ( ! is_array( $cfg ) ) {
				return null;
			}
			if ( empty( $cfg['slug'] ) || empty( $cfg['item_id'] ) || empty( $cfg['store_url'] ) ) {
				return null; // Required fields missing.
			}

			// Sanitize the slug once, up front, so every derived value is consistent.
			$slug = sanitize_key( $cfg['slug'] );

			$defaults = [
				'name'          => $slug,
				'menu_title'    => 'License',
				'capability'    => 'manage_options',
				'option_prefix' => $slug,
			];

			$cfg                  = array_merge( $defaults, $cfg ); // Consumer values override defaults.
			$cfg['slug']          = $slug;                          // Canonical, sanitized key.
			$cfg['option_prefix'] = sanitize_key( $cfg['option_prefix'] ); // Always a clean option key.

			return $cfg;
		}

		/** @return array<string, array> Registered plugin configs keyed by slug. */
		public function get_plugins() {
			return $this->plugins;
		}
	}
}
