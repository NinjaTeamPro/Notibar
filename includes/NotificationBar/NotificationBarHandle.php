<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

class NotificationBarHandle
{
  protected static $instance = null;
  private $hook_suffix = array();
  var $valueDefault = array();

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
      'hide_close_button' => 'no_button',
      'content_width'     => '',
      'position_type'     => 'fixed',
      'link_style'        => 'text',
      'text'              =>  'This is default text',
      'lb_text'           => 'yes',
      'lb_url'            => '',
      'bg_color'          => '',
      'text_color'        => '',
      'lb_color'          => '',
      'font_size'         => '12',
      'dp_homepage'       => true,
      'dp_pages'          => true,
      'dp_posts'          => true,
      'dp_pp_id'          =>  ''
    )) ;

    add_action('admin_menu', array($this, 'njt_nofi_showMenu'));

    //Register Enqueue
    add_action('wp_enqueue_scripts', array($this, 'njt_nofi_homeRegisterEnqueue'));
    //add_action('admin_enqueue_scripts', array($this, 'adminRegisterEnqueue'));

    add_action('wp', array( $this, 'njt_nofi_showNotification'));
		add_action('customize_register', array( $this, 'njt_nofi_customizeNotification'));
  }

  public function get_settings() {
    if ( ! empty( $this->settings ) && ! is_customize_preview() ) {
      return $this->settings;
    }
    $this->settings = apply_filters( 'njt_nofi_bar_settings', get_theme_mod( 'njt_nofi_customNoti' ));
    $this->settings = wp_parse_args( $this->settings, $this->default_settings );
    return $this->settings;
  }

  public function get_setting( $name, $fallback = false ) {
    $this->get_settings();
    if ( isset( $this->settings[ $name ] ) ) {
      return $this->settings[ $name ];
    }
    if ( $fallback ) {
      return $this->defaults[ $name ];
    }
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

  public function njt_nofi_homeRegisterEnqueue()
  {
    wp_register_style('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/css/home-notification-bar.css');
    wp_enqueue_style('njt-nofi');

    wp_register_script('njt-nofi', NJT_NOFI_PLUGIN_URL . 'assets/home/js/home-notification-bar.js', array('jquery'));
    wp_enqueue_script('njt-nofi');
  }




  public function njt_nofi_notificationSettings()
  {
    echo ('rrrrrrrrrrrrrrrrr');
  }

  public function njt_nofi_showNotification()
  {
    // Display Notification Bar.
    add_action( 'wp_body_open', array( $this, 'display_notification' ) );
  }

  public function display_notification()
  {
    ?>
      <div class="njt-nofi-container">
        <div class="njt-nofi-notification-bar">
          <div class="njt-nofi-content">
            <div class="njt-nofi-text"><?php echo (get_theme_mod( 'njt_nofi_text' ))?></div>
            <div class="njt-nofi-button">
								<a href="#" class="njt-nofi-button-text">Get started</a>
						</div>
          </div>
          <a href="#" class="njt-nofi-hide" style="color:#fffff;"><span>+</span></a>
        </div>
      </div>
    <?php
    
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
    ));

    $customNoti->add_control( 'njt_nofi_text_control', array(
      'label'       => __('Text', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_content',
      'settings'    => 'njt_nofi_text',
      'type'        => 'textarea',
    ));

    //Link/Button Text
    $customNoti->add_setting('njt_nofi_lb_text', array(
      'default'           => $this->valueDefault['lb_text'],
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
    ));

    $customNoti->add_control( 'njt_nofi_pp_id_control', array(
      'label'    => __( 'By Pages/Posts ID', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_display',
      'settings' => 'njt_nofi_pp_id',
      'type'     => 'text',
    ));
  }
}