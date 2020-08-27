<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

class WpCustomNotification
{
  protected static $instance = null;
  
  public static function getInstance()
  {
    if (null == self::$instance) {
      self::$instance = new self;
    }

    return self::$instance;
  }
  private function __construct()
  {
    $this->valueDefault = apply_filters( 'njt_nofi_notification_bar_default_values', array(
      'hide_close_button' => 'close_button',
      'content_width'     => '900',
      'position_type'     => 'fixed',
      'link_style'        => 'button',
      'text'              => esc_html('This is default text for notification bar'),
      'lb_text'           => esc_html('agree'),
      'lb_url'            => '',
      'bg_color'          => '#1e73be',
      'text_color'        => '#000000',
      'lb_color'          => '#dd3333',
      'font_size'         => '15',
      'dp_homepage'       => true,
      'dp_pages'          => true,
      'dp_posts'          => true,
      'dp_pp_id'          => ''
    )) ;

    add_action('customize_register', array( $this, 'njt_nofi_customizeNotification'), 10);
  }

  public function njt_nofi_sanitizeSelect( $input, $setting ){
          
    $input = sanitize_key($input);

    $choices = $setting->manager->get_control( $setting->id )->choices;
                      
    return ( array_key_exists( $input, $choices ) ? $input : $setting->default );                
  }

  function njt_nofi_sanitizeCheckbox( $input ){
    //returns true if checkbox is checked
    return ( isset( $input ) ? true : false );
  }

  public function njt_nofi_customizeNotification($customNoti)
  {
    $customNoti->add_panel( 'njt_nofi_customNoti', array(
      'title'=>'WordPress Notification Bar',
      'description'=> 'This is panel WordPress Notification Bar',
      'priority'=> 10,
    ) );

    /* Option General */
    $customNoti->add_section( 'njt_nofi_general', array(
      'title'    => __( 'Option General',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel' => 'njt_nofi_customNoti',
    ) );

   
    // Hide/Close Button (No button, Toggle button, Close button)
    $customNoti->add_setting('njt_nofi_hide_close_button', array(
      'default'           => $this->valueDefault['hide_close_button'],
      'sanitize_callback' => $this->njt_nofi_sanitizeSelect
    ));

    $customNoti->add_control( 'njt_nofi_hide_close_button_control', array(
      'label'    => __( 'Hide/Close Button', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_general',
      'settings' => 'njt_nofi_hide_close_button',
      'type'     => 'select',
      'choices'    => array(
        'no_button'     => esc_html__( 'No button', NJT_NOFI_DOMAIN ),
        'toggle_button' => esc_html__( 'Toggle button', NJT_NOFI_DOMAIN ),
        'close_button'  => esc_html__( 'Close button', NJT_NOFI_DOMAIN ),
      ),
    ));

    // Content Width (px)
    $customNoti->add_setting('njt_nofi_content_width', array(
      'default'           => $this->valueDefault['content_width'],
      'sanitize_callback' => 'absint', //converts value to a non-negative integer
    ));

    $customNoti->add_control( 'njt_nofi_content_width_control', array(
      'label'       => __( 'Content Width (px)', 'NJT_NOFI_DOMAIN' ),
      'section'     => 'njt_nofi_general',
      'settings'    => 'njt_nofi_content_width',
      'type'        => 'number',
    ));

    //Position Type
    $customNoti->add_setting('njt_nofi_position_type', array(
      'default'           => $this->valueDefault['position_type'],
      'sanitize_callback' => $this->njt_nofi_sanitizeSelect
    ));

    $customNoti->add_control( 'njt_nofi_position_type_control', array(
      'label'    => __( 'Position Type', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_general',
      'settings' => 'njt_nofi_position_type',
      'type'     => 'select',
      'choices'    => array(
        'fixed'     => esc_html__( 'Fixed', NJT_NOFI_DOMAIN ),
        'absolute' => esc_html__( 'Absolute', NJT_NOFI_DOMAIN ),
      ),
    ));

    /*Content*/
    $customNoti->add_section( 'njt_nofi_content', array(
      'title'    => __( 'Option Content',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel' => 'njt_nofi_customNoti',
    ));

    // Link Style
    $customNoti->add_setting('njt_nofi_link_style', array(
      'default'           => $this->valueDefault['link_style'],
      'sanitize_callback' => $this->njt_nofi_sanitizeSelect
    ));

    $customNoti->add_control( 'njt_nofi_link_style_control', array(
      'label'    => __( 'Link Style ', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_content',
      'settings' => 'njt_nofi_link_style',
      'type'     => 'select',
      'choices'    => array(
        'text'     => esc_html__( 'Text', NJT_NOFI_DOMAIN ),
        'button' => esc_html__( 'Button', NJT_NOFI_DOMAIN ),
      ),
    ));

    //Text
    $customNoti->add_setting('njt_nofi_text', array(
      'default'           => $this->valueDefault['text'],
      'sanitize_callback' => 'wp_filter_nohtml_kses', //removes all HTML from content
      'transport'         => 'postMessage',
    ));

    $customNoti->selective_refresh->add_partial('njt_nofi_text', array(
      'selector'            => '.njt-nofi-container',
    ) );

    $customNoti->add_control( 'njt_nofi_text_control', array(
      'label'       => __('Text', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_content',
      'settings'    => 'njt_nofi_text',
      'type'        => 'textarea',
    ));

    //Link/Button Text
    $customNoti->add_setting('njt_nofi_lb_text', array(
      'default'           => $this->valueDefault['lb_text'],
      'sanitize_callback' => 'wp_filter_nohtml_kses', //removes all HTML from content
    ));

    $customNoti->add_control('njt_nofi_lb_text_control', array(
      'label'       => __('Link/Button Text', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_content',
      'settings'    => 'njt_nofi_lb_text',
      'type'        => 'text',
    ));

    //Link/Button URL
    $customNoti->add_setting('njt_nofi_lb_url', array(
      'default'           => $this->valueDefault['lb_url'],
      'sanitize_callback' => 'esc_url_raw', //cleans URL from all invalid characters
    ));

    $customNoti->add_control('njt_nofi_lb_url_control', array(
      'label'       => __('Link/Button URL', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_content',
      'settings'    => 'njt_nofi_lb_url',
      'type'        => 'text',
    ));

    /*Style*/
    $customNoti->add_section( 'njt_nofi_style', array(
      'title'    => __( 'Option Style',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel' => 'njt_nofi_customNoti',
    ));

    //Background Color
    $customNoti->add_setting('njt_nofi_bg_color', array(
      'default'           => $this->valueDefault['bg_color'],
      'sanitize_callback' => 'sanitize_hex_color'
    ));

    $customNoti->add_control('njt_nofi_bg_color_control', array(
      'label'       => __('Background Color', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_style',
      'settings'    => 'njt_nofi_bg_color',
      'type'        => 'color',
    ));

    //Text Color
    $customNoti->add_setting('njt_nofi_text_color', array(
      'default'           => $this->valueDefault['text_color'],
      'sanitize_callback' => 'sanitize_hex_color'
    ));

    $customNoti->add_control('njt_nofi_text_color_control', array(
      'label'       => __('Text Color', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_style',
      'settings'    => 'njt_nofi_text_color',
      'type'        => 'color',
    ));

    //Link/Button Color
    $customNoti->add_setting('njt_nofi_lb_color', array(
      'default'           =>$this->valueDefault['lb_color'],
      'sanitize_callback' => 'sanitize_hex_color'
    ));

    $customNoti->add_control('njt_nofi_lb_color_control', array(
      'label'       => __('Link/Button Color', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_style',
      'settings'    => 'njt_nofi_lb_color',
      'type'        => 'color',
    ));

    //Font Size (px)
    $customNoti->add_setting('njt_nofi_font_size', array(
      'default'           => $this->valueDefault['font_size'],
      'sanitize_callback' => 'absint', //converts value to a non-negative integer
    ));

    $customNoti->add_control('njt_nofi_font_size_control', array(
      'label'       => __('Font Size (px)', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_style',
      'settings'    => 'njt_nofi_font_size',
      'type'        => 'number',
    ));

    /* Display */
    $customNoti->add_section( 'njt_nofi_display', array(
      'title'    => __( 'Option Display',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel' => 'njt_nofi_customNoti',
    ));

    //Homepage
    $customNoti->add_setting('njt_nofi_homepage', array(
      'default'           => $this->valueDefault['dp_homepage'],
      'sanitize_callback' => $this->njt_nofi_sanitizeCheckbox
    ));

    $customNoti->add_control( 'njt_nofi_homepage_control', array(
      'label'    => __( 'Homepage', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_display',
      'settings' => 'njt_nofi_homepage',
      'type'     => 'checkbox',
    ));

    //Pages
    $customNoti->add_setting('njt_nofi_pages', array(
      'default'           => $this->valueDefault['dp_pages'],
      'sanitize_callback' => $this->njt_nofi_sanitizeCheckbox
    ));

    $customNoti->add_control( 'njt_nofi_pages_control', array(
      'label'    => __( 'Pages', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_display',
      'settings' => 'njt_nofi_pages',
      'type'     => 'checkbox',
    ));


    //Posts
    $customNoti->add_setting('njt_nofi_posts', array(
      'default'           => $this->valueDefault['dp_posts'],
      'sanitize_callback' => $this->njt_nofi_sanitizeCheckbox
    ));

    $customNoti->add_control( 'njt_nofi_posts_control', array(
      'label'    => __( 'Posts', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_display',
      'settings' => 'njt_nofi_posts',
      'type'     => 'checkbox',
    ));


    //By Pages/Posts ID
    $customNoti->add_setting('njt_nofi_pp_id', array(
      'default'           => $this->valueDefault['dp_pp_id'],
      'sanitize_callback' => 'wp_filter_nohtml_kses', //removes all HTML from content
    ));

    $customNoti->add_control( 'njt_nofi_pp_id_control', array(
      'label'    => __( 'By Pages/Posts ID', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_display',
      'settings' => 'njt_nofi_pp_id',
      'type'     => 'text',
      'description' => esc_html__( 'Enter the Pages or Posts ID, Ex: 1,2' ),
    ));
  }
}