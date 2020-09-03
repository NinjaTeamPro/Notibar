<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

  class WpCustomControlColorPreset extends \WP_Customize_Control 
  {
    public $type = 'njtColorText';
    public function render_content() {
      ?>
        <div class="simple-notice-custom-control">
          <?php if( !empty( $this->label ) ) { ?>
              <span id="nj_color_select_presets">
                  <div class="customize-control-title"><?php echo esc_html( $this->label ); ?></div>
                  <div class="nj-list-prese-color">
                    <div class="type-circle type-circle-1 <?php if($this->value() == 1) echo('type-circle-active')?>" data-type="1" data-value="#ff0000,#0000ff"></div>
                    <div class="type-circle type-circle-2 <?php if($this->value() == 2) echo('type-circle-active')?>" data-type="2" data-value="#000000,#0000ff"></div>
                    <div class="type-circle type-circle-3 <?php if($this->value() == 3) echo('type-circle-active')?>" data-type="3" data-value="#adff2f,#0000ff"></div>
                    <div class="type-circle type-circle-4 <?php if($this->value() == 4) echo('type-circle-active')?>" data-type="4" data-value="#1ecc2b,#000000"></div>
                    <div class="type-circle type-circle-5 <?php if($this->value() == 5) echo('type-circle-active')?>" data-type="5" data-value="#d0ad05,#2ad000"></div>
                    <div class="type-circle type-circle-6 <?php if($this->value() == 6) echo('type-circle-active')?>" data-type="6" data-value="#2d6764,#ff7878"></div>
                  </div>
                  <input id="_customize-input-njt_nofi_preset_color" class="njt_nofi_none" type="number" value="<?php echo esc_html($this->settings['default']->default); ?>" data-customize-setting-link="njt_nofi_preset_color">
              </span>
          <?php } ?>
          <?php if( !empty( $this->description ) ) { ?>
              <span class="customize-control-description"><?php echo wp_kses_post( $this->description ); ?></span>
          <?php } ?>
        </div>
      <?php
    }
  }

