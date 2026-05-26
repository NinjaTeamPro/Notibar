<?php
/**
 * GoProPage — Lite-only "Go Pro" admin page.
 *
 * Renders a Free vs Pro comparison table plus an upgrade CTA. Registered only
 * in the Lite edition (see NotificationBarHandleAdmin::njt_nofi_showMenu); Pro
 * users never see it. Pure static content — no React, no REST.
 *
 * @package NjtNotificationBar\NotificationBar
 */

namespace NjtNotificationBar\NotificationBar;

defined( 'ABSPATH' ) || exit;

class GoProPage {

	const PAGE_SLUG = 'notibar-go-pro';

	/**
	 * Feature rows for the comparison table. Each: [ label, free, pro ] where
	 * a value is true (✓), false (✗) or 'soon' (Coming soon badge).
	 * Mirrors https://ninjateam.gitbook.io/notibar/getting-started/free-vs-pro
	 *
	 * @return array<int,array{0:string,1:bool,2:bool|string}>
	 */
	private static function features(): array {
		return [
			// Shared (Free + Pro).
			[ __( 'Multiple bars / messages', 'notibar' ), true, true ],
			[ __( 'Scheduling start & end date/time', 'notibar' ), true, true ],
			[ __( 'Re-display after a specified period', 'notibar' ), true, true ],
			[ __( 'Absolute & fixed display', 'notibar' ), true, true ],
			[ __( 'Different content for mobile', 'notibar' ), true, true ],
			[ __( 'Hide or display on specific pages/posts', 'notibar' ), true, true ],
			[ __( 'Auto ON/OFF daily schedule', 'notibar' ), true, true ],
			[ __( 'One-click to duplicate', 'notibar' ), true, true ],
			[ __( 'Drag and drop to reorder bars', 'notibar' ), true, true ],
			[ __( 'Compatible with cache & lazyload', 'notibar' ), true, true ],
			[ __( '100% mobile-responsive', 'notibar' ), true, true ],
			[ __( 'Import / Export set of bars', 'notibar' ), true, true ],
			[ __( 'HTML & CSS supported', 'notibar' ), true, true ],
			// Pro-only.
			[ __( 'Hide/display on WooCommerce products & custom post types', 'notibar' ), false, true ],
			[ __( 'A/B testing (Rotation mode)', 'notibar' ), false, true ],
			[ __( 'Rotation interval in seconds', 'notibar' ), false, true ],
			[ __( 'Pause rotation on hover', 'notibar' ), false, true ],
			[ __( 'Rotate bars by sequence or random', 'notibar' ), false, true ],
			[ __( 'Advanced reports (Click tracking)', 'notibar' ), false, true ],
			[ __( 'Display bar at bottom', 'notibar' ), false, true ],
			[ __( 'Conditional display by role or user', 'notibar' ), false, true ],
			// Coming soon (Pro).
			[ __( 'Multilingual support', 'notibar' ), false, 'soon' ],
		];
	}

	/**
	 * Render one Free/Pro cell.
	 *
	 * @param bool|string $value true | false | 'soon'.
	 * @return string HTML.
	 */
	private static function cell( $value ): string {
		if ( 'soon' === $value ) {
			return '<span class="njt-gopro-soon">' . esc_html__( 'Coming soon', 'notibar' ) . '</span>';
		}
		if ( $value ) {
			return '<span class="njt-gopro-yes" aria-label="' . esc_attr__( 'Included', 'notibar' ) . '">&#10003;</span>';
		}
		return '<span class="njt-gopro-no" aria-label="' . esc_attr__( 'Not included', 'notibar' ) . '">&#10007;</span>';
	}

	/**
	 * Admin page callback.
	 *
	 * @return void
	 */
	public static function render(): void {
		$url = defined( 'NJT_NOFI_UPGRADE_URL' ) ? NJT_NOFI_UPGRADE_URL : '';
		$cta = '<a class="button button-primary button-hero njt-gopro-cta" href="'
			. esc_url( $url ) . '" target="_blank" rel="noopener noreferrer">'
			. esc_html__( 'Get Notibar Pro', 'notibar' ) . '</a>';
		?>
		<div class="wrap njt-gopro">
			<h1><?php esc_html_e( 'Notibar — Free vs Pro', 'notibar' ); ?></h1>
			<p class="njt-gopro-intro">
				<?php esc_html_e( 'Unlock rotation & A/B testing, WooCommerce / custom post type targeting, and advanced click reports. See what you get with Notibar Pro:', 'notibar' ); ?>
			</p>

			<p><?php echo $cta; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_url/esc_html above ?></p>

			<table class="njt-gopro-table widefat striped">
				<thead>
					<tr>
						<th><?php esc_html_e( 'Feature', 'notibar' ); ?></th>
						<th class="njt-gopro-col"><?php esc_html_e( 'Free', 'notibar' ); ?></th>
						<th class="njt-gopro-col"><?php esc_html_e( 'Pro', 'notibar' ); ?></th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ( self::features() as $row ) : ?>
						<tr>
							<td><?php echo esc_html( $row[0] ); ?></td>
							<td class="njt-gopro-col"><?php echo self::cell( $row[1] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- cell() returns escaped HTML ?></td>
							<td class="njt-gopro-col"><?php echo self::cell( $row[2] ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- cell() returns escaped HTML ?></td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>

			<p><?php echo $cta; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- built from esc_url/esc_html above ?></p>
		</div>
		<?php
		self::styles();
	}

	/**
	 * Scoped inline styles for the page — one static admin page does not justify
	 * a build entry or an enqueued stylesheet.
	 *
	 * @return void
	 */
	private static function styles(): void {
		?>
		<style>
			.njt-gopro-intro { max-width: 760px; font-size: 14px; }
			.njt-gopro-cta { margin: 6px 0; }
			.njt-gopro-table { max-width: 760px; margin-top: 12px; }
			.njt-gopro-table th, .njt-gopro-table td { padding: 10px 14px; }
			.njt-gopro-col { width: 90px; text-align: center; }
			.njt-gopro-table th.njt-gopro-col { text-align: center; }
			.njt-gopro-yes { color: #1bb934; font-weight: 700; font-size: 16px; }
			.njt-gopro-no { color: #c3c4c7; font-size: 16px; }
			.njt-gopro-soon { font-size: 12px; font-style: italic; color: #646970; }
			.njt-gopro .njt-gopro-cta.button-primary,
			.njt-gopro .njt-gopro-cta.button-primary:hover,
			.njt-gopro .njt-gopro-cta.button-primary:focus {
				background: #fec900;
				border-color: #e6b500;
				color: #fff;
				text-shadow: none;
				box-shadow: none;
			}
			.njt-gopro .njt-gopro-cta.button-primary:hover,
			.njt-gopro .njt-gopro-cta.button-primary:focus {
				background: #e6b500;
				border-color: #cca200;
			}
		</style>
		<?php
	}

	/**
	 * Highlight the "Go Pro" menu item. Hooked on admin_head only in Lite.
	 *
	 * @return void
	 */
	public static function menuHighlightCss(): void {
		echo '<style>#adminmenu a[href*="page=' . esc_attr( self::PAGE_SLUG )
			. '"]{color:#ffb900;font-weight:600;}</style>';
	}
}
