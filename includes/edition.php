<?php
/**
 * Notibar edition flag — single source of truth for Pro vs Lite.
 *
 * Source tree ships as PRO (constant = true). The Lite release build
 * (`release.sh --lite`) swaps this file for build-tools/edition.lite.php
 * (constant = false) via pro-manifest.json "replace".
 *
 * Lite KEEPS the Pro feature controls but renders them locked + badged; this
 * flag tells the React apps which state to render. The heavy Pro LOGIC
 * (rotation engine, tracking backend) is still physically stripped from Lite.
 *
 * @package NjtNotificationBar
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'NJT_NOFI_IS_PRO' ) ) {
	define( 'NJT_NOFI_IS_PRO', true );
}
