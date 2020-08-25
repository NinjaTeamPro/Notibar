<?php
namespace BigNinja\Page;

defined('ABSPATH') || exit;
/**
 * Settings Page
 */
class Settings {
  protected static $instance = null;
  
  public static function getInstance() {
    if (null == self::$instance) {
      self::$instance = new self;
    }
    
    return self::$instance;
  }

  private $pageId = null;

  private function __construct() {
    add_action('admin_menu', array($this, 'settingsMenu'));
    add_action('admin_enqueue_scripts', array($this, 'enqueueAdminScripts'));

    add_filter('plugin_action_links_big-ninja/big-ninja.php', array($this, 'addActionLinks'));
  }

  public function settingsMenu() {
    add_submenu_page('options-general.php', __('Big Ninja Settings', BN_DOMAIN), __('Big Ninja Settings', BN_DOMAIN), 'manage_options', $this->getPageId(), array($this, 'settingsPage'));
  }

  public function settingsPage() {
    $viewPath = BN_PLUGIN_PATH . 'views/pages/html-settings.php';
    include_once $viewPath;
  }

  public function addActionLinks($links) {
    $settingsLinks = array(
      '<a href="' . admin_url('options-general.php?page=' . $this->getPageId()) . '">Settings</a>',
    );
    return array_merge($settingsLinks, $links);
  }

  public function enqueueAdminScripts($screenId) {
    if ($screenId === 'settings_page_big-ninja-settings') {
      $scriptId = $this->getPageId();
      wp_enqueue_script($scriptId, BN_PLUGIN_URL . 'assets/js/settings.js', array('jquery'), BN_VERSION);

      wp_localize_script($scriptId, 'wpData', array(
        'test' => 'Ninja Team Test',
      ));
    }
  }

  public function getPageId() {
    if (null == $this->pageId) {
      $this->pageId = BN_PREFIX . '-settings';
    }

    return $this->pageId;
  }
}
