<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

  class WpCustomControlColorBg extends \WP_Customize_Control 
  {
    public $type = 'simple_notice';
    public function render_content() {
      ?>
        <div class="simple-notice-custom-control">
          <?php if( !empty( $this->label ) ) { ?>
              <span class="customize-control-title "><?php echo esc_html( $this->label ); ?></span>
              <span id="nj_color_select_bg">
                <input id="_customize-input-njt_nofi_bg_color" class="njt_nofi_dp_none" type="text" value="<?php echo esc_html($this->settings['default']->default); ?>" data-customize-setting-link="njt_nofi_bg_color">
              </span>
          <?php } ?>
          <?php if( !empty( $this->description ) ) { ?>
              <span class="customize-control-description"><?php echo wp_kses_post( $this->description ); ?></span>
          <?php } ?>
        </div>
      <?php
    }
  }

