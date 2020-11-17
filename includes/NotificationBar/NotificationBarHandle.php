<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

use NjtNotificationBar\NotificationBar\WpCustomNotification;
use NjtNotificationBar\NotificationBar\WpMobileDetect;

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
    add_filter('plugin_action_links_notibar/njt-notification-bar.php', array($this, 'addActionLinks'));
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
    $urlEncode = urlencode('autofocus[panel]') ;
    $link = esc_html(admin_url('/customize.php?'. $urlEncode.'=njt_notification-bar'));
    foreach($submenu['options-general.php'] as $k=>$item){
      if ($item[2] == 'njt_nofi_NotificationBar') {
        $submenu['options-general.php'][$k][2] =  $link;
      }
    }

    $this->hook_suffix = array($settings_suffix);
  }

  public function njt_nofi_homeRegisterEnqueue()
  {
    $isDisplayNotification = $this->njt_nofi_isDisplayNotification();
    $isEnableNotification = get_theme_mod('njt_nofi_enable_bar', 1) == 1 ? true : false;
    $isdevicesDisplay = $this->njt_nofi_devicesDisplay();

    if($this->njt_nofi_checkDisplayNotification() && $isdevicesDisplay) {
      wp_register_style('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/css/home-notification-bar.css', array(), NJT_NOFI_VERSION);
      wp_enqueue_style('njt-nofi');

      wp_register_script('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/js/home-notification-bar.js', array('jquery'),NJT_NOFI_VERSION, true );
      wp_enqueue_script('njt-nofi');

      wp_localize_script('njt-nofi', 'wpData', array(
        'admin_ajax' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce("njt-nofi-notification"),
        'isPositionFix' => get_theme_mod( 'njt_nofi_position_type', $this->valueDefault['position_type'] ) == 'fixed' ? true : false,
        'hideCloseButton' => get_theme_mod( 'njt_nofi_hide_close_button',$this->valueDefault['hide_close_button']),
        'isDisplayButton' => get_theme_mod( 'njt_nofi_handle_button', 1),
        'presetColor' => get_theme_mod( 'njt_nofi_preset_color', $this->valueDefault['preset_color']),
        'alignContent' => get_theme_mod( 'njt_nofi_alignment', $this->valueDefault['align_content']),
        'textColorNotification' => get_theme_mod('njt_nofi_text_color', $this->valueDefault['text_color']),
        'textButtonColor' => get_theme_mod('njt_nofi_lb_text_color',$this->valueDefault['lb_text_color']),
        'wp_is_mobile' => wp_is_mobile(),
        'is_customize_preview' => is_customize_preview()
      ));
    }
  }

  public function addActionLinks($links) {
    $urlEncode = urlencode('autofocus[panel]') ;
    $linkUrl= esc_html(admin_url('/customize.php?'. $urlEncode.'=njt_notification-bar'));
    $settingsLinks = array(
      '<a href="'.$linkUrl.'">Settings</a>',
    );
    return array_merge($settingsLinks, $links);
  }

 
  public function njt_nofi_notificationSettings()
  {
    exit;
  }

  public function njt_nofi_checkDisplayNotification() {
    $isDisplayNotification = $this->njt_nofi_isDisplayNotification();
    $isEnableNotification = get_theme_mod('njt_nofi_enable_bar', 1) == 1 ? true : false;
    if($isDisplayNotification && is_customize_preview() ) {
      return true;
     }
    if($isDisplayNotification && $isEnableNotification && !is_customize_preview()) {
      return true;
    }
    return false;
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

  public function njt_nofi_devicesDisplay() {
    $isdevicesDisplay = get_theme_mod('njt_nofi_devices_display', $this->valueDefault['devices_display']);
    if($isdevicesDisplay == 'all_devices') {
      return true;
    }
    if ($isdevicesDisplay == 'desktop' && !wp_is_mobile() ) {
      return true;
    }
    if ($isdevicesDisplay == 'mobile' && wp_is_mobile() ) {
      return true;
    }
    return false;
  }


  public function njt_nofi_showNotification()
  {
    // Display Notification Bar.
    $isDisplayNotification = $this->njt_nofi_isDisplayNotification();
    $isEnableNotification = get_theme_mod('njt_nofi_enable_bar', 1) == 1 ? true : false;
    $isdevicesDisplay = $this->njt_nofi_devicesDisplay();
  
    if($isDisplayNotification && $isdevicesDisplay && is_customize_preview()) {
     add_action( 'wp_footer', array( $this, 'display_notification' ),10);
    }

    if($isDisplayNotification && $isEnableNotification && $isdevicesDisplay && !is_customize_preview()) {
      add_action( 'wp_footer', array( $this, 'display_notification' ),10);
     }
    add_action( 'wp_footer', array( $this, 'njt_nofi_rederInput' ),10);
  }

  public function display_notification()
  {
    
    if (wp_is_mobile()) {
      $contentWidth = '100%';
    } else {
      $contentWidth = get_theme_mod('njt_nofi_content_width') != null ? get_theme_mod('njt_nofi_content_width').'px' : '100%';
    }
  
    $isPositionFix = get_theme_mod('njt_nofi_position_type', $this->valueDefault['position_type']) == 'fixed' ? true : false;
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
        /* body{
          padding-top: 49px;
        } */
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