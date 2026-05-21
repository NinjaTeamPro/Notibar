<?php
/**
 * Admin-side features for NotificationBarHandle.
 *
 * Contains: admin menu wiring, review notice, save-review AJAX,
 * review JS enqueue, action-links filter, notification-settings stub.
 *
 * Extracted from NotificationBarHandle to keep each file ≤ 200 LOC.
 *
 * @package NjtNotificationBar\NotificationBar
 * @since   3.0.0
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

/**
 * Trait NotificationBarHandleAdmin
 */
trait NotificationBarHandleAdmin {

	/** @var string[] */
	private $hook_suffix = [];

	/**
	 * Register the Notibar top-level admin menu with two submenus.
	 *
	 *   Notibar
	 *     ├── Customize → URL-hacked to customize.php?autofocus[section]=njt_nofi_bars_section
	 *     └── Settings  → admin.php?page=notibar-settings (renders settings-app React mount)
	 *
	 * First submenu slug equals parent slug so WP collapses the duplicate label —
	 * the standard pattern for top-level menus.
	 *
	 * @return void
	 */
	public function njt_nofi_showMenu(): void {
		global $submenu;

		add_menu_page(
			__( 'Notibar', NJT_NOFI_DOMAIN ),
			__( 'Notibar', NJT_NOFI_DOMAIN ),
			'manage_options',
			'notibar-customize',
			[ $this, 'njt_nofi_renderCustomizeStub' ],
			'dashicons-bell',
			25
		);

		add_submenu_page(
			'notibar-customize',
			__( 'Customize', NJT_NOFI_DOMAIN ),
			__( 'Customize', NJT_NOFI_DOMAIN ),
			'manage_options',
			'notibar-customize',
			[ $this, 'njt_nofi_renderCustomizeStub' ]
		);

		$settings_suffix = add_submenu_page(
			'notibar-customize',
			__( 'Settings', NJT_NOFI_DOMAIN ),
			__( 'Settings', NJT_NOFI_DOMAIN ),
			'manage_options',
			'notibar-settings',
			[ $this, 'njt_nofi_renderSettings' ]
		);

		// URL-hack the Customize submenu entry to deep-link into Customizer
		// with the Notibar panel auto-focused. WP follows the entry's index-2
		// URL when present, so the renderCustomizeStub callback never fires.
		$url_encode = urlencode( 'autofocus[section]' );
		$link       = esc_url( admin_url( '/customize.php?' . $url_encode . '=njt_nofi_bars_section' ) );

		if ( isset( $submenu['notibar-customize'] ) ) {
			foreach ( $submenu['notibar-customize'] as $k => $item ) {
				if ( $item[2] === 'notibar-customize' ) {
					$submenu['notibar-customize'][ $k ][2] = $link; // phpcs:ignore WordPress.WP.GlobalVariablesOverride
				}
			}
		}

		// add_submenu_page returns false when current user lacks capability —
		// guard so the hook_suffix consumers (review notice / Phase 02 enqueue
		// gate) never see a literal false in the array.
		if ( $settings_suffix ) {
			$this->hook_suffix = [ $settings_suffix ];
		}
	}

	/**
	 * @return void
	 */
	public function njt_nofi_give_review(): void {
		if ( ! function_exists( 'get_current_screen' ) ) {
			return;
		}
		if ( get_current_screen()->id !== 'plugins' ) {
			return;
		}

		$this->enqueue_scripts();
		?>
		<div class="notice notice-success is-dismissible" id="njt-nofi-review">
			<h3><?php _e( 'Give Notibar a review', NJT_NOFI_DOMAIN ); ?></h3>
			<p>
				<?php _e( 'Thank you for choosing Notibar. We hope you love it. Could you take a couple of seconds posting a nice review to share your happy experience?', NJT_NOFI_DOMAIN ); ?>
			</p>
			<p>
				<?php _e( 'We will be forever grateful. Thank you in advance ;)', NJT_NOFI_DOMAIN ); ?>
			</p>
			<p>
				<a href="javascript:;" data="rateNow" class="button button-primary" style="margin-right: 5px"><?php _e( 'Rate now', NJT_NOFI_DOMAIN ); ?></a>
				<a href="javascript:;" data="later" class="button" style="margin-right: 5px"><?php _e( 'Later', NJT_NOFI_DOMAIN ); ?></a>
				<a href="javascript:;" data="alreadyDid" class="button"><?php _e( 'Already did', NJT_NOFI_DOMAIN ); ?></a>
			</p>
		</div>
		<?php
	}

	/**
	 * @return void
	 */
	public function njt_nofi_save_review(): void {
		if ( isset( $_POST ) ) {
			$nonce = isset( $_POST['nonce'] ) ? sanitize_text_field( $_POST['nonce'] ) : null;
			$field = isset( $_POST['field'] ) ? sanitize_text_field( $_POST['field'] ) : null;

			if ( ! wp_verify_nonce( $nonce, 'njt-nofi-review' ) ) {
				wp_send_json_error( [ 'status' => 'Wrong nonce validate!' ] );
				exit();
			}

			if ( $field === 'later' ) {
				update_option( 'njt_nofi_review', time() + 3 * 60 * 60 * 24 );
			} elseif ( $field === 'alreadyDid' ) {
				update_option( 'njt_nofi_review', 0 );
			}
			wp_send_json_success();
		}
		wp_send_json_error( [ 'message' => 'Update fail!' ] );
	}

	/**
	 * @return void
	 */
	public function enqueue_scripts(): void {
		wp_enqueue_script(
			'njt-nofi-review',
			NJT_NOFI_PLUGIN_URL . 'assets/admin/js/review.js',
			[ 'jquery' ],
			NJT_NOFI_VERSION,
			false
		);
		wp_localize_script(
			'njt-nofi-review',
			'wpDataNofi',
			[
				'admin_ajax' => admin_url( 'admin-ajax.php' ),
				'nonce'      => wp_create_nonce( 'njt-nofi-review' ),
			]
		);
	}

	/**
	 * @param array $links
	 * @return array
	 */
	public function addActionLinks( array $links ): array {
		$url_encode = urlencode( 'autofocus[section]' );
		$link_url   = esc_url( admin_url( '/customize.php?' . $url_encode . '=njt_nofi_bars_section' ) );

		return array_merge(
			[ '<a href="' . $link_url . '">' . __( 'Settings', NJT_NOFI_DOMAIN ) . '</a>' ],
			$links
		);
	}

	/**
	 * Customize submenu callback — never reached at runtime because the
	 * URL hack in njt_nofi_showMenu() redirects clicks to customize.php.
	 * Defensive stub kept so direct hits to admin.php?page=notibar-customize
	 * (e.g. before the $submenu hack runs) terminate cleanly rather than
	 * rendering an empty admin shell.
	 *
	 * @return void
	 */
	public function njt_nofi_renderCustomizeStub(): void {
		$url_encode = urlencode( 'autofocus[section]' );
		wp_safe_redirect( admin_url( 'customize.php?' . $url_encode . '=njt_nofi_bars_section' ) );
		exit;
	}

	/**
	 * Settings submenu callback — prints the React mount node. The
	 * settings-app bundle is enqueued by AssetLoader::enqueue_settings_app()
	 * (phase 02) on this page's hook suffix.
	 *
	 * @return void
	 */
	public function njt_nofi_renderSettings(): void {
		echo '<div class="wrap"><div id="njt-notibar-settings-app"></div></div>';
	}
}
