<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

class NotificationBarHandle
{
  protected static $instance = null;
  private $hook_suffix = array();

  public static function getInstance()
  {
    if (null == self::$instance) {
      self::$instance = new self;
    }

    return self::$instance;
  }

  private function __construct()
  {
    add_action('admin_menu', array($this, 'njt_nofi_showMenu'));
  }

  public function njt_nofi_showMenu()
  {
    $settings_suffix = add_menu_page(
      __('Notification Bar', NJT_NOFI_DOMAIN),
      __('Notification Bar', NJT_NOFI_DOMAIN),
      'manage_options',
      __('Notification Bar', NJT_NOFI_DOMAIN),
      array($this, 'njt_nofi_notificationSettings'),
      '',
      10
    );
    $this->hook_suffix = array($settings_suffix);
  }

  public function njt_nofi_notificationSettings()
  {
    echo ('rrrrrrrrrrrrrrrrr');
  }
}