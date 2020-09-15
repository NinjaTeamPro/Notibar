<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit; 

use NjtNotificationBar\NotificationBar\WpCustomControlColorBg;
use NjtNotificationBar\NotificationBar\WpCustomControlColorText;
use NjtNotificationBar\NotificationBar\WpCustomControlColorLb;
use NjtNotificationBar\NotificationBar\WpCustomControlColorPreset;

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
      'preset_color'      => 1,
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
    add_action('customize_controls_enqueue_scripts', array( $this, 'njt_nofi_enqueueCustomizeControls'));
    //add_action('customize_controls_print_scripts', array($this, 'addScripts'));
    add_action('customize_preview_init', array($this, 'addScriptsCustomizer'));
  }

   /**
     * Enqueue script for customizer control
     */
  public function njt_nofi_enqueueCustomizeControls()
  {
    wp_register_script('njt-nofi-cus-control', NJT_NOFI_PLUGIN_URL . 'assets/admin/js/admin-customizer-control.js', array('jquery'));
    wp_enqueue_script('njt-nofi-cus-control');

    wp_register_style('njt-nofi-cus-control', NJT_NOFI_PLUGIN_URL . 'assets/admin/css/admin-customizer-control.css');
    wp_enqueue_style('njt-nofi-cus-control');
  }
  public function addScriptsCustomizer(){
    wp_register_script('njt-nofi-test', NJT_NOFI_PLUGIN_URL . 'assets/admin/js/admin-customizebar.js', array('jquery'),NJT_NOFI_VERSION,true);
    wp_enqueue_script('njt-nofi-test');

  }
  public function addScripts() {
    ?>
    <script type="text/javascript">
			jQuery( document ).ready( function( $ ) {
				wp.customize.panel('njt_notification-bar', function( section ) {
					section.expanded.bind( function( isExpanded ) {
						if ( isExpanded ) {
							wp.customize.previewer.previewUrl.set( '<?php echo NJT_NOFI_SITE_URL ; ?>' );
						}
          } );
        } );
      } );
		</script>
		<?php
}

  public function njt_nofi_sanitizeSelect( $input, $setting ){
          
    $input = sanitize_key($input);

    $choices = $setting->manager->get_control( $setting->id.'_control' )->choices;
                      
    return ( array_key_exists( $input, $choices ) ? $input : $setting->default );                
  }

  function njt_nofi_sanitizeCheckbox( $input ){
    //returns true if checkbox is checked
     return ( $input ? true : false );
  }

  public function njt_nofi_customizeNotification($customNoti)
  {
    $customNoti->add_panel( 'njt_notification-bar', array(
      'title'       => __('WordPress Notification Bar',NJT_NOFI_DOMAIN),
      'description' => __('This is panel WordPress Notification Bar',NJT_NOFI_DOMAIN),
      'priority'    => 10,
    ) );

    /* Option General */
    $customNoti->add_section( 'njt_nofi_general', array(
      'title'    => __( 'General Option',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel'    => 'njt_notification-bar',
    ) );
   
    // Hide/Close Button (No button, Toggle button, Close button)
    $customNoti->add_setting('njt_nofi_hide_close_button', array(
      'default'           => $this->valueDefault['hide_close_button'],
      'sanitize_callback' => array($this,'njt_nofi_sanitizeSelect'),
       'transport'         => 'postMessage',
    ));
    
    $customNoti->add_control( 'njt_nofi_hide_close_button_control', array(
      'label'           => __( 'Hide/Close Button', NJT_NOFI_DOMAIN ),
      'section'         => 'njt_nofi_general',
      'settings'        => 'njt_nofi_hide_close_button',
      'type'            => 'select',
      'choices'         => array(
        'no_button'     => esc_html__( 'No button', NJT_NOFI_DOMAIN ),
        'toggle_button' => esc_html__( 'Toggle button', NJT_NOFI_DOMAIN ),
        'close_button'  => esc_html__( 'Close button', NJT_NOFI_DOMAIN ),
      ),
    ));

    // Content Width (px)
    $customNoti->add_setting('njt_nofi_content_width', array(
      'default'           => $this->valueDefault['content_width'],
      'sanitize_callback' => 'absint', //converts value to a non-negative integer
      'transport'         => 'postMessage'
    ));

    $customNoti->add_control( 'njt_nofi_content_width_control', array(
      'label'    => __( 'Content Width (px)', 'NJT_NOFI_DOMAIN' ),
      'section'  => 'njt_nofi_general',
      'settings' => 'njt_nofi_content_width',
      'type'     => 'number',
    ));

    //Position Type
    $customNoti->add_setting('njt_nofi_position_type', array(
      'default'           => $this->valueDefault['position_type'],
      'sanitize_callback' => array($this,'njt_nofi_sanitizeSelect'),
      'transport'         => 'postMessage'
    ));

    $customNoti->add_control( 'njt_nofi_position_type_control', array(
      'label'      => __( 'Position Type', NJT_NOFI_DOMAIN ),
      'section'    => 'njt_nofi_general',
      'settings'   => 'njt_nofi_position_type',
      'type'       => 'select',
      'choices'    => array(
        'fixed'    => esc_html__( 'Fixed', NJT_NOFI_DOMAIN ),
        'absolute' => esc_html__( 'Absolute', NJT_NOFI_DOMAIN ),
      ),
    ));

    /*Content*/
    $customNoti->add_section( 'njt_nofi_content', array(
      'title'    => __( 'Content Option',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel'    => 'njt_notification-bar',
    ));

    // Link Style
    $customNoti->add_setting('njt_nofi_link_style', array(
      'default'           => $this->valueDefault['link_style'],
      'sanitize_callback' =>  array($this, 'njt_nofi_sanitizeSelect'),
      'transport'         => 'postMessage'
    ));

    $customNoti->add_control( 'njt_nofi_link_style_control', array(
      'label'    => __( 'Link Style ', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_content',
      'settings' => 'njt_nofi_link_style',
      'type'     => 'select',
      'choices'  => array(
        'text'   => esc_html__( 'Text', NJT_NOFI_DOMAIN ),
        'button' => esc_html__( 'Button', NJT_NOFI_DOMAIN ),
      ),
    ));

    //Text
    $customNoti->add_setting('njt_nofi_text', array(
      'default'           => $this->valueDefault['text'],
      'sanitize_callback' => 'wp_kses_post', //keeps only HTML tags that are allowed in post content
      'transport'         => 'postMessage',
    ));

    $customNoti->selective_refresh->add_partial( 'njt_nofi_text', array(
      'selector'            => '.njt-nofi-notification-bar',
      'primarySetting'      => 'njt_nofi_text',
      'container_inclusive' => true,
      'fallback_refresh'    => false,
    ) );

    $customNoti->add_control( 'njt_nofi_text_control', array(
      'label'    => __('Text', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_content',
      'settings' => 'njt_nofi_text',
      'type'     => 'textarea',
    ));

    //Link/Button Text
    $customNoti->add_setting('njt_nofi_lb_text', array(
      'default'           => $this->valueDefault['lb_text'],
      'sanitize_callback' => 'wp_filter_nohtml_kses', //removes all HTML from content
      'transport'         => 'postMessage',
    ));

    $customNoti->add_control('njt_nofi_lb_text_control', array(
      'label'    => __('Link/Button Text', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_content',
      'settings' => 'njt_nofi_lb_text',
      'type'     => 'text',
    ));

    //Link/Button URL
    $customNoti->add_setting('njt_nofi_lb_url', array(
      'default'           => $this->valueDefault['lb_url'],
      'sanitize_callback' => 'esc_url_raw', //cleans URL from all invalid characters
      'transport'         => 'postMessage',
    ));

    $customNoti->add_control('njt_nofi_lb_url_control', array(
      'label'    => __('Link/Button URL', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_content',
      'settings' => 'njt_nofi_lb_url',
      'type'     => 'text',
    ));

    /*Style*/
    $customNoti->add_section( 'njt_nofi_style', array(
      'title'    => __( 'Style Option',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel'    => 'njt_notification-bar',
    ));

    //Preset Color
    $customNoti->add_setting( 'njt_nofi_preset_color', array(
        'default' => $this->valueDefault['preset_color'],
        'transport'         => 'postMessage',
      )
    );
    
    $customNoti->add_control(
      new WpCustomControlColorPreset( $customNoti, 'njt_nofi_preset_color',
      array(
        'label'    => __('Preset Color', NJT_NOFI_DOMAIN ),
        'section'  => 'njt_nofi_style',
        'settings' => 'njt_nofi_preset_color'
      )
    ));

    //Background Color
    $customNoti->add_setting( 'njt_nofi_bg_color',
      array(
          'default'           => $this->valueDefault['bg_color'],
          'sanitize_callback' => 'sanitize_hex_color',
          'transport'         => 'postMessage',
      )
    );
    
    $customNoti->add_control(
      new WpCustomControlColorBg( $customNoti, 'njt_nofi_bg_color',
      array(
        'label'    => __('Background Color', NJT_NOFI_DOMAIN ),
        'section'  => 'njt_nofi_style',
        'settings' => 'njt_nofi_bg_color'
      )
    ));

    //Text Color
    $customNoti->add_setting( 'njt_nofi_text_color',
      array(
          'default'           => $this->valueDefault['text_color'],
          'sanitize_callback' => 'sanitize_hex_color',
          'transport'         => 'postMessage',
      )
    );
  
    $customNoti->add_control(
      new WpCustomControlColorText( $customNoti, 'njt_nofi_text_color',
      array(
        'label'    => __('Text Color', NJT_NOFI_DOMAIN ),
        'section'  => 'njt_nofi_style',
        'settings' => 'njt_nofi_text_color',
      )
    ));

    //Link/Button Color 
    $customNoti->add_setting('njt_nofi_lb_color', array(
      'default'           =>$this->valueDefault['lb_color'],
      'sanitize_callback' => 'sanitize_hex_color',
      'transport'         => 'postMessage',
    ));

    $customNoti->add_control(
      new WpCustomControlColorLb( $customNoti, 'njt_nofi_lb_color',
      array(
        'label'    => __('Link/Button Color', NJT_NOFI_DOMAIN ),
        'section'  => 'njt_nofi_style',
        'settings' => 'njt_nofi_lb_color'
      )
    ));

    //Font Size (px)
    $customNoti->add_setting('njt_nofi_font_size', array(
      'default'           => $this->valueDefault['font_size'],
      'sanitize_callback' => 'absint', //converts value to a non-negative integer
      'transport'         => 'postMessage'
    ));

    $customNoti->add_control('njt_nofi_font_size_control', array(
      'label'    => __('Font Size (px)', NJT_NOFI_DOMAIN ),
      'section'  => 'njt_nofi_style',
      'settings' => 'njt_nofi_font_size',
      'type'     => 'number',
    ));

    /* Display */
    $customNoti->add_section( 'njt_nofi_display', array(
      'title'    => __( 'Display Option',NJT_NOFI_DOMAIN),
      'priority' => 10,
      'panel'    => 'njt_notification-bar',
    ));

    //Homepage
    $customNoti->add_setting('njt_nofi_homepage', array(
      'default'           => $this->valueDefault['dp_homepage'],
      'sanitize_callback' =>  array($this, 'njt_nofi_sanitizeCheckbox'),
      'transport'         => 'postMessage'
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
      'sanitize_callback' => array($this, 'njt_nofi_sanitizeCheckbox'),
      'transport'         => 'postMessage',
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
      'sanitize_callback' => array($this, 'njt_nofi_sanitizeCheckbox'),
      'transport'         => 'postMessage',
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
      'transport'         => 'postMessage'
    ));

    $customNoti->add_control( 'njt_nofi_pp_id_control', array(
      'label'       => __( 'By Pages/Posts ID', NJT_NOFI_DOMAIN ),
      'section'     => 'njt_nofi_display',
      'settings'    => 'njt_nofi_pp_id',
      'type'        => 'text',
      'description' => esc_html__( 'Enter the Pages or Posts ID, Ex: 1,2' ),
    ));    
  }

 
}