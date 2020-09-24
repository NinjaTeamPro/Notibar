<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

use NjtNotificationBar\NotificationBar\WpCustomNotification;

class NotificationBarHandle
{
  protected static $instance = null;
  private $hook_suffix = array();
  private $valueDefault = null;

  public static function getInstance()
  {
    if (null == self::$instance) {
      self::$instance = new self;
    }

    return self::$instance;
  }

  private function __construct()
  {
    $WpCustomNotification = WpCustomNotification::getInstance();
    $this->valueDefault = $WpCustomNotification->valueDefault;

    add_action('admin_menu', array($this, 'njt_nofi_showMenu'));
 
    add_action('wp', array( $this, 'njt_nofi_showNotification'));
    
    //Register Enqueue
    add_action('wp_enqueue_scripts', array($this, 'njt_nofi_homeRegisterEnqueue'));
    add_action('admin_enqueue_scripts', array($this, 'njt_nofi_adminRegisterEnqueue'));
  }

  public function njt_nofi_showMenu()
  {
    global $submenu;

    $settings_suffix = add_submenu_page(
      'options-general.php',
      __('Notification Bar', NJT_NOFI_DOMAIN),
      __('Notibar', NJT_NOFI_DOMAIN),
      'manage_options',
      'njt_nofi_NotificationBar',
      array($this, 'njt_nofi_notificationSettings')
    );
    $urlEncode = urlencode('autofocus[panel]=njt_notification-bar') ;
    $link = esc_html(admin_url('/customize.php?'. $urlEncode));
    foreach($submenu['options-general.php'] as $k=>$item){
      if ($item[2] == 'njt_nofi_NotificationBar') {
        $submenu['options-general.php'][$k][2] =  $link;
      }
    }

    $this->hook_suffix = array($settings_suffix);
  }

  public function njt_nofi_homeRegisterEnqueue()
  {
    wp_register_style('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/css/home-notification-bar.css', array(), NJT_NOFI_VERSION);
    wp_enqueue_style('njt-nofi');

    wp_register_script('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/js/home-notification-bar.js', array('jquery'),NJT_NOFI_VERSION, true );
    wp_enqueue_script('njt-nofi');

    wp_register_script('njt-nofi-cus', NJT_NOFI_PLUGIN_URL . 'assets/admin/js/mediaelement.min.js', array('jquery'));
    wp_enqueue_script('njt-nofi-cus');


    wp_localize_script('njt-nofi', 'wpData', array(
      'admin_ajax' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce("njt-nofi-notification"),
      'isPositionFix' => get_theme_mod( 'njt_nofi_position_type', $this->valueDefault['position_type'] ) == 'fixed' ? true : false
    ));
  }

  public function njt_nofi_adminRegisterEnqueue($suffix) {
    if (in_array($suffix, $this->hook_suffix)) {
      wp_register_script('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/admin/js/admin-notification-bar.js', array('jquery'), NJT_NOFI_VERSION);
      wp_enqueue_script('njt-nofi');

      wp_localize_script('njt-nofi', 'wpData', array(
        'admin_ajax' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce("njt-nofi-notification"),
        'isPositionFix' => get_theme_mod( 'njt_nofi_position_type', $this->valueDefault['position_type'] ) == 'fixed' ? true : false
      ));
    }
  }

  public function njt_nofi_notificationSettings()
  {
    exit;
  }

  public function njt_nofi_isDisplayNotification() {

    $isDisplayHome = get_theme_mod('njt_nofi_homepage', $this->valueDefault['dp_homepage'] ) ;
    $isDisplayPage = get_theme_mod('njt_nofi_pages', $this->valueDefault['dp_pages'] ) ;
    $isDisplayPosts = get_theme_mod('njt_nofi_posts', $this->valueDefault['dp_posts']) ;
    $isDisplayPageOrPostId = get_theme_mod('njt_nofi_pp_id');
    $arrDisplayPageOrPostId = explode(",",$isDisplayPageOrPostId);
    $currentPageOrPostID = get_the_ID();

    if($isDisplayHome && is_home() || $isDisplayHome && is_front_page()) {
      return true;
    } else if($isDisplayPage && is_page()) {
      return true;
    } else if($isDisplayPosts && is_single()) {
      return true;
    } else if( in_array($currentPageOrPostID, $arrDisplayPageOrPostId)){
      return true;
    }

    return false;
  }


  public function njt_nofi_showNotification()
  {
    // Display Notification Bar.
    $isDisplayNotification = $this->njt_nofi_isDisplayNotification();

    if($isDisplayNotification) {
      add_action( 'wp_body_open', array( $this, 'display_notification' ),10);
    }
    add_action( 'wp_body_open', array( $this, 'njt_nofi_rederInput' ),10);
  }

  public function display_notification()
  {
    $contentWidth = get_theme_mod('njt_nofi_content_width') != null ? get_theme_mod('njt_nofi_content_width').'px' : '100%';
    $isPositionFix = get_theme_mod('njt_nofi_position_type', $this->valueDefault['position_type']) == 'fixed' ? true : false;
    $isDisplayButton = get_theme_mod('njt_nofi_handle_button', 0) == 1 ? true : false;
    $bgColorNotification = get_theme_mod('njt_nofi_bg_color', $this->valueDefault['bg_color']);
    $textColorNotification = get_theme_mod('njt_nofi_text_color', $this->valueDefault['text_color']);
    $lbColorNotification = get_theme_mod('njt_nofi_lb_color', $this->valueDefault['lb_color']);
    $notificationFontSize = get_theme_mod('njt_nofi_font_size', $this->valueDefault['font_size']);

    ?>
      <style>
        .njt-nofi-notification-bar .njt-nofi-hide-button {
          display: none;
        }
        .njt-nofi-notification-bar .njt-nofi-content {
          font-size : <?php echo esc_html($notificationFontSize.'px') ?>;
        }
      </style>
    <?php

    $viewPath = NJT_NOFI_PLUGIN_PATH . 'views/pages/home/home-notification-bar.php';
    include_once $viewPath;
  }

  public function njt_nofi_rederInput() {
    $dataDisplay = array(
      'is_home' => is_home(),
      'is_page' => is_page(),
      'is_single' => is_single(),
      'id_page' => get_the_ID()
    );

    ?>
      <input type="hidden" id="njt_nofi_checkDisplayReview" name="njt_nofi_checkDisplayReview" value='<?php echo (json_encode( $dataDisplay ))?>'>
    <?php
  }
}