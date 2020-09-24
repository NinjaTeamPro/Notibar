<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

  class WpCustomControlColorText extends \WP_Customize_Control 
  {
    public $type = 'njtColorText';
    public function render_content() {
      ?>
        <div class="simple-notice-custom-control">
          <?php if( !empty( $this->label ) ) { ?>
              
              <span id="nj_color_select_text">
              <div class="wp-picker-container wp-picker-active">
                  <button type="button" class="button wp-color-result wp-picker-open nj_color_button_select_bg" aria-expanded="true" style="background-color: rgb(90, 94, 137);">
                    <span class="wp-color-result-text">Select Color</span>
                  </button>
                </div>
                  <span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
                  <input id="_customize-input-njt_nofi_text_color" class="njt_nofi_dp_none" type="text" value="<?php echo esc_html($this->settings['default']->default); ?>" data-customize-setting-link="njt_nofi_text_color">
              </span>
          <?php } ?>
          <?php if( !empty( $this->description ) ) { ?>
              <span class="customize-control-description"><?php echo wp_kses_post( $this->description ); ?></span>
          <?php } ?>
        </div>
      <?php
    }
  }

