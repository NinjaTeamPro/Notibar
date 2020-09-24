<?php
/**
 * Plugin Name: Notibar
 * Plugin URI: https://ninjateam.org
 * Description: Internal template for plugin with OOP, namespace, autoload function.
 * Version: 1.0
 * Author: Ninja Team
 * Author URI: https://ninjateam.org
 * Text Domain: njt-notification-bar
 * Domain Path: /i18n/languages/
 *
 * @package NjtNotificationBar
 */

namespace NjtNotificationBar;

defined('ABSPATH') || exit;

define('NJT_NOFI_PREFIX', 'njt_nofi');
define('NJT_NOFI_VERSION', '1.0');
define('NJT_NOFI_DOMAIN', 'njt-notification-bar');

define('NJT_NOFI_PLUGIN_URL', plugin_dir_url(__FILE__));
define('NJT_NOFI_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('NJT_NOFI_SITE_URL', site_url());

spl_autoload_register(function ($class) {
  $prefix = __NAMESPACE__; // project-specific namespace prefix
  $base_dir = __DIR__ . '/includes'; // base directory for the namespace prefix

  $len = strlen($prefix);
  if (strncmp($prefix, $class, $len) !== 0) { // does the class use the namespace prefix?
    return; // no, move to the next registered autoloader
  }

  $relative_class_name = substr($class, $len);

  // replace the namespace prefix with the base directory, replace namespace
  // separators with directory separators in the relative class name, append
  // with .php
  $file = $base_dir . str_replace('\\', '/', $relative_class_name) . '.php';

  if (file_exists($file)) {
    require $file;
  }
});

function init() {
  Plugin::getInstance();
  I18n::getInstance();

  NotificationBar\WpCustomNotification::getInstance();
  NotificationBar\NotificationBarHandle::getInstance();
}
add_action('plugins_loaded', 'NjtNotificationBar\\init');

register_activation_hook(__FILE__, array('NjtNotificationBar\\Plugin', 'activate'));
register_deactivation_hook(__FILE__, array('NjtNotificationBar\\Plugin', 'deactivate'));
