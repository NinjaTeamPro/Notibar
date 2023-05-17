<?php

namespace NjtNotificationBar\NotificationBar;

defined('ABSPATH') || exit;

class WpCustomControlMultiselect extends \WP_Customize_Control
{
  public $type = 'multiple-select';
  public function render_content() {
    ?>
      <label >
        <span class="customize-control-title"><?php echo esc_html($this->label); ?></span>
        <div id="njt-nofi-select2-modal" class="" tabindex="-1" role="dialog" >
          <select multiple="multiple" class="njt-nofi-select2-multiple" data-tags="true" data-placeholder="Select an option">
          </select>
        </div>
        <input id="_customize-input-njt_nofi_pp_id" class="njt_nofi_none" type="text" value="" data-customize-setting-link="njt_nofi_pp_id">
      </label>
    <?php 
  }
}
