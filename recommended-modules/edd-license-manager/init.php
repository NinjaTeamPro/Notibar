<?php

declare(strict_types=1);

namespace YayRecommendedModules\EddLicenseManager;

defined( 'ABSPATH' ) || exit;

// Global license-state helpers — defined at module load (plugins_loaded:0) so consumers can gate
// during plugins_loaded, independent of boot(). See functions.php.
require_once __DIR__ . '/functions.php';

class Plugin
{
    public static function boot(): void
    {
        require __DIR__ . '/main.php';
        require __DIR__ . '/class-license-api-client.php';
        require __DIR__ . '/class-license-admin-page.php';
        require __DIR__ . '/class-license-ajax.php';
        require __DIR__ . '/class-license-updater.php';
        require __DIR__ . '/class-license-guard.php';
        require __DIR__ . '/class-license-row-notice.php';
        require __DIR__ . '/class-license-cron.php';
        // The EDD updater vendor lib is required lazily in NjtEddLicenseUpdater::wire() (class_exists-guarded).
        \NjtEddLicenseManagerMain::get_instance()->init();
    }
}

if ( function_exists( 'add_action' ) ) {
    add_action( 'plugins_loaded', [ Plugin::class, 'boot' ] );
}
