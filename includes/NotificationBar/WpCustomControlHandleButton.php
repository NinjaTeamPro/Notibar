<?php
namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

  class WpCustomControlHandleButton extends \WP_Customize_Control 
  {
    public $type = 'njtHandleButton';
    public function render_content() {
      ?>
        <div class="simple-notice-custom-control">
          <?php if( !empty( $this->label ) ) { ?>
            <span class="customize-control-title"><?php echo esc_html( $this->label ); ?></span>
            <label class="njt-handle-button-switch" for="njt-handle-button">
                <input id="njt-handle-button" name="njt-handle-button" type="checkbox">
                <div class="slider round"></div>
            </label>
          <?php } ?>
        </div>
      <?php
    }
  }

