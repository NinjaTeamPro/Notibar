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
    //add_action('admin_enqueue_scripts', array($this, 'njt_nofi_adminRegisterEnqueue'));
  }

  public function njt_nofi_showMenu()
  {
    global $menu;

    $settings_suffix = add_menu_page(
      __('Notification Bar', NJT_NOFI_DOMAIN),
      __('Notification Bar', NJT_NOFI_DOMAIN),
      'manage_options',
      'njt_nofi_NotificationBar',
      array($this, 'njt_nofi_notificationSettings'),
      '',
      10
    );

    $link = esc_html(admin_url('/customize.php?autofocus[panel]=njt_nofi_customNoti'));
    foreach($menu as $k=>$item){
      if ($item[2] == 'njt_nofi_NotificationBar') {
        $menu[$k][2] =  $link;
      }
    }

    $this->hook_suffix = array($settings_suffix);
  }

  public function njt_nofi_homeRegisterEnqueue()
  {
    wp_register_style('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/css/home-notification-bar.css');
    wp_enqueue_style('njt-nofi');

    wp_register_script('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/js/home-notification-bar.js', array('jquery'));
    wp_enqueue_script('njt-nofi');

    wp_localize_script('njt-nofi', 'wpData', array(
      'admin_ajax' => admin_url('admin-ajax.php'),
      'nonce' => wp_create_nonce("njt-nofi-notification"),
      'isPositionFix' => get_theme_mod( 'njt_nofi_position_type', $this->valueDefault['position_type'] ) == 'fixed' ? true : false
    ));
  }

  public function njt_nofi_adminRegisterEnqueue($suffix) {
    if (in_array($suffix, $this->hook_suffix)) {
      wp_register_script('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/admin/js/admin-notification-bar.js', array('jquery'));
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

    if($isDisplayHome && is_home()) {
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
  }

  public function display_notification()
  {
    
    $contentWidth = get_theme_mod('njt_nofi_content_width') != null ? get_theme_mod('njt_nofi_content_width').'px' : '100%';
    $isPositionFix = get_theme_mod('njt_nofi_position_type', $this->valueDefault['position_type']) == 'fixed' ? true : false;
    $isLinkStyleButton = get_theme_mod('njt_nofi_link_style', $this->valueDefault['link_style']) == 'button' ? true : false;
    $bgColorNotification = get_theme_mod('njt_nofi_bg_color', $this->valueDefault['bg_color']);
    $textColorNotification = get_theme_mod('njt_nofi_text_color', $this->valueDefault['text_color']);
    $lbColorNotification = get_theme_mod('njt_nofi_lb_color', $this->valueDefault['lb_color']);
    $notificationFontSize = get_theme_mod('njt_nofi_font_size', $this->valueDefault['font_size']);

    $typeButton = '';
    if (get_theme_mod( 'njt_nofi_hide_close_button', $this->valueDefault['hide_close_button'] ) == 'no_button') {
      $typeButton = 'njt-nofi-hide-button';
    }

    if (get_theme_mod( 'njt_nofi_hide_close_button', $this->valueDefault['hide_close_button'] ) == 'toggle_button') {
      $typeButton = 'njt-nofi-toggle-button';
    }

    if (get_theme_mod( 'njt_nofi_hide_close_button', $this->valueDefault['hide_close_button'] ) == 'close_button') {
      $typeButton = 'njt-nofi-close-button';
    }

    ?>
      <style >
      
        .njt-nofi-notification-bar .njt-nofi-hide-button{
          display: none;
        }
        .njt-nofi-notification-bar .njt-nofi-content{
          font-size : <?php echo($notificationFontSize.'px') ?>;
          width: <?php echo ($contentWidth) ?>;
        }
        .njt-nofi-container .njt-nofi-text-color {
          color: <?php echo ($textColorNotification) ?> !important;
        }

        .njt-nofi-container .njt-nofi-bgcolor-notification {
          background: <?php echo ($bgColorNotification) ?>;
        }

        <?php if($isPositionFix) { ?>
          .njt-nofi-container {
            position: fixed;
            z-index: 999;
            width: 100%;
          }

        <?php } ?>

        <?php if($isLinkStyleButton) { ?>
          .njt-nofi-notification-bar .njt-nofi-button {
            padding: 5px 10px;
            background: <?php echo($lbColorNotification)?> ;
            border-radius: 5px;
          }
          .njt-nofi-notification-bar .njt-nofi-button-text {
            color: #ffff !important;
          }
        <?php } else {?>
          .njt-nofi-notification-bar .njt-nofi-button-text {
            color: <?php echo($lbColorNotification)?> !important;
          }
        <?php } ?>

      </style>
    <?php

    $viewPath = NJT_NOFI_PLUGIN_PATH . 'views/pages/home/home-notification-bar.php';
    include_once $viewPath;
  }
}