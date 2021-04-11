<?php
namespace NjtNotificationBar;

defined('ABSPATH') || exit;
/**
 * Plugin activate/deactivate logic
 */
class Plugin {
  protected static $instance = null;

  public static function getInstance() {
    if (null == self::$instance) {
      self::$instance = new self;
    }

    return self::$instance;
  }

  private function __construct() {
  }

  /** Plugin activated hook */
  public static function activate() {
    $currentVersion = get_option('njt_nofi_version');
    if ( version_compare(NJT_NOFI_VERSION, $currentVersion, '>' ) ) { 
      $filebirdCross = \FileBirdCross::get_instance('filebird', 'filebird+ninjateam', NJT_NOFI_PLUGIN_URL, array('filebird/filebird.php', 'filebird-pro/filebird.php'));
      $filebirdCross->need_update_option();
      update_option('njt_nofi_version', NJT_NOFI_VERSION);
    }
  }

  /** Plugin deactivate hook */
  public static function deactivate() {
  }
}