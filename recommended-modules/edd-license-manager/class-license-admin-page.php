<?php

defined( 'ABSPATH' ) || exit;

/**
 * License admin page — registers one License submenu per plugin and renders the UI.
 *
 * Markup + localized state only. Button actions are wired by the AJAX layer (Phase 4),
 * which enqueues the script and supplies the nonce. PHP 7.1+ compatible.
 */
if ( ! class_exists( 'NjtEddLicenseAdminPage' ) ) {
	class NjtEddLicenseAdminPage {

		/** @var NjtEddLicenseApiClient */
		private $client;

		public function __construct( NjtEddLicenseApiClient $client ) {
			$this->client = $client;
		}

		/** Add a submenu page under each plugin's parent_slug. Hooked on admin_menu. */
		public function register_menus( array $plugins ) {
			foreach ( $plugins as $cfg ) {
				if ( empty( $cfg['parent_slug'] ) ) {
					continue; // No parent menu → nowhere to attach.
				}
				add_submenu_page(
					$cfg['parent_slug'],
					$cfg['name'] . ' ' . __( 'License', 'filebird' ),
					$cfg['menu_title'],
					$cfg['capability'],
					$cfg['option_prefix'] . '-license',
					function () use ( $cfg ) {
						$this->render( $cfg );
					}
				);
			}
		}

		public function render( array $cfg ) {
			if ( ! current_user_can( $cfg['capability'] ) ) {
				wp_die( esc_html__( 'You do not have permission to view this page.', 'filebird' ) );
			}

			$status  = $this->client->get_status( $cfg );
			$data    = $this->client->get_data( $cfg );
			$key     = $this->client->get_key( $cfg );
			$has_key = ( '' !== $key );
			$badge   = $this->badge( $status );
			?>
			<div class="wrap njt-edd-license" data-slug="<?php echo esc_attr( $cfg['slug'] ); ?>">
				<div class="njt-edd-layout">
					<div class="njt-edd-main njt-edd-card">
						<h2 class="njt-edd-title"><?php echo esc_html( $cfg['name'] ); ?></h2>

						<?php if ( ! $has_key ) : ?>
							<p class="njt-edd-label"><?php esc_html_e( 'Your license key:', 'filebird' ); ?></p>
							<div class="njt-edd-row">
								<span class="njt-edd-key-field">
									<input type="password" class="regular-text njt-edd-key" autocomplete="off"
										placeholder="<?php esc_attr_e( 'License key', 'filebird' ); ?>" />
									<button type="button" class="njt-edd-key-toggle" aria-pressed="false"
										aria-label="<?php esc_attr_e( 'Show license key', 'filebird' ); ?>">
										<span class="dashicons dashicons-visibility" aria-hidden="true"></span>
									</button>
								</span>
								<button type="button" class="button button-primary njt-edd-activate"><?php esc_html_e( 'Activate License', 'filebird' ); ?></button>
							</div>
						<?php else : ?>
							<p>
								<span class="njt-edd-badge" style="background:<?php echo esc_attr( $badge['color'] ); ?>"><?php echo esc_html( $badge['label'] ); ?></span>
							</p>
							<table class="form-table njt-edd-meta"><tbody>
								<tr>
									<th scope="row"><?php esc_html_e( 'License Key', 'filebird' ); ?></th>
									<td><code class="njt-edd-key"><?php echo esc_html( $this->mask( $key ) ); ?></code></td>
								</tr>
								<?php if ( ! empty( $data['expires'] ) ) : ?>
								<tr><th scope="row"><?php esc_html_e( 'Expires', 'filebird' ); ?></th><td><?php echo esc_html( $data['expires'] ); ?></td></tr>
								<?php endif; ?>
								<?php if ( isset( $data['activations_left'] ) ) : // null (unlimited) hidden by isset(). ?>
								<tr><th scope="row"><?php esc_html_e( 'Activations Left', 'filebird' ); ?></th><td><?php echo esc_html( $data['activations_left'] ); ?></td></tr>
								<?php endif; ?>
							</tbody></table>
							<div class="njt-edd-row">
								<button type="button" class="button njt-edd-check"><?php esc_html_e( 'Refresh Status', 'filebird' ); ?></button>
								<button type="button" class="button njt-edd-remove"><?php esc_html_e( 'Remove License', 'filebird' ); ?></button>
							</div>
						<?php endif; ?>

						<p class="njt-edd-extra">
							<button type="button" class="button-link njt-edd-update-check"><?php esc_html_e( 'Check for updates', 'filebird' ); ?></button>
						</p>
						<p class="njt-edd-message" style="display:none"></p>
					</div>

					<?php $this->aside( $cfg ); ?>
				</div>
			</div>
			<?php
		}

		/** Right-hand help column: how to find the key + what activation unlocks. */
		private function aside( array $cfg ) {
			$dashboard = ! empty( $cfg['account_url'] ) ? $cfg['account_url'] : $cfg['store_url'];
			$benefits  = [
				__( 'Start using the Pro version', 'filebird' ),
				__( 'Auto-update to the latest version', 'filebird' ),
				__( 'Get bug fixes and security updates fastest', 'filebird' ),
				__( 'Custom CSS & theme tweaks upon requests', 'filebird' ),
				__( 'Premium technical support', 'filebird' ),
				__( 'Live Chat 1-1 for any questions', 'filebird' ),
			];
			?>
			<div class="njt-edd-side">
				<div class="njt-edd-card">
					<h3><?php esc_html_e( 'Getting Started (How to find license keys)', 'filebird' ); ?></h3>
					<p><?php esc_html_e( 'Please follow the steps below:', 'filebird' ); ?></p>
					<ol class="njt-edd-steps">
						<li><?php printf(
							/* translators: %s: dashboard link */
							esc_html__( 'Log in to your %s', 'filebird' ),
							'<a href="' . esc_url( $dashboard ) . '" target="_blank" rel="noopener">' . esc_html__( 'Ninjateam Dashboard', 'filebird' ) . '</a>'
						); ?></li>
						<li><?php printf(
							/* translators: %s: License Keys tab name */
							esc_html__( 'Go to %s tab', 'filebird' ),
							'<strong>' . esc_html__( 'License Keys', 'filebird' ) . '</strong>'
						); ?></li>
						<li><?php esc_html_e( 'Copy your license key and paste it in this License tab', 'filebird' ); ?></li>
						<li><?php esc_html_e( "Click Activate - you're all set!", 'filebird' ); ?></li>
					</ol>
				</div>
				<div class="njt-edd-card">
					<h3><?php esc_html_e( "What you'll get when activating license:", 'filebird' ); ?></h3>
					<ul class="njt-edd-benefits">
						<?php foreach ( $benefits as $benefit ) : ?>
							<li><?php echo esc_html( $benefit ); ?></li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>
			<?php
		}

		/** @return array{label:string,color:string} */
		private function badge( $status ) {
			switch ( $status ) {
				case 'valid':
					return [ 'label' => __( 'Active', 'filebird' ), 'color' => '#2e7d32' ];
				case 'expired':
					return [ 'label' => __( 'Expired', 'filebird' ), 'color' => '#ef6c00' ];
				default:
					return [ 'label' => __( 'Inactive', 'filebird' ), 'color' => '#c62828' ];
			}
		}

		/** Mask a stored key for display (never render the full key when one is set). */
		private function mask( $key ) {
			$len = strlen( $key );
			if ( $len <= 8 ) {
				return str_repeat( '•', $len );
			}
			return substr( $key, 0, 4 ) . str_repeat( '•', $len - 8 ) . substr( $key, -4 );
		}
	}
}
