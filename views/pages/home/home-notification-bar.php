<?php
  defined('ABSPATH') || exit;
  
?>

<div class="njt-nofi-container" style="<?php if($isPositionFix) { echo ( 'position: fixed'); } else {  echo ( 'position: absolute'); }?>">
  <div class="njt-nofi-notification-bar njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_html($bgColorNotification)) ?>">
    <div class="njt-nofi-content njt-nofi-text-color" style="<?php echo esc_html($contentWidth) ?>">
      <div class="njt-nofi-text"><?php echo get_theme_mod( 'njt_nofi_text', $this->valueDefault['text'] )?></div>
      <div class="njt-nofi-button" 
      style="<?php if($isDisplayButton) {
        echo ('background:' .esc_html($lbColorNotification).
              ';border-radius:5px'
              );
        } else { echo ('display: none');}?>">
          <a href="<?php echo esc_html(get_theme_mod( 'njt_nofi_lb_url', $this->valueDefault['lb_url'] ))?>" class="njt-nofi-button-text"><?php echo esc_html(get_theme_mod( 'njt_nofi_lb_text', $this->valueDefault['lb_text']))?></a>
      </div>
    </div>
    <a href="javascript:void(0)" class="njt-nofi-toggle-button njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom" style="color:#fffff;"><span>+</span></a>
    <a href="javascript:void(0)" class="njt-nofi-close-button njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom" style="color:#fffff;"><span>+</span></a>
  </div>
  <div>
    <a href="javascript:void(0)" class="njt-nofi-display-toggle njt-nofi-text-color njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_html($bgColorNotification)) ?>"><span>+</span></a>
  </div>
</div>
<script> 
  var newValue = '<?php echo get_theme_mod( 'njt_nofi_hide_close_button'); ?>'
  if (newValue == 'no_button') {
    jQuery(".njt-nofi-toggle-button").css({
      'display': 'none',
    })
    jQuery(".njt-nofi-close-button").css({
      'display': 'none',
    })
  }

  if (newValue == 'toggle_button') {
    jQuery(".njt-nofi-toggle-button").css({
      'display': 'block',
    })
    jQuery(".njt-nofi-close-button").css({
      'display': 'none',
    })
  }

  if (newValue == 'close_button') {
    jQuery(".njt-nofi-close-button").css({
      'display': 'block',
    })
    jQuery(".njt-nofi-toggle-button").css({
      'display': 'none',
    })
  }

  var isDisplayButton = '<?php echo get_theme_mod( 'njt_nofi_handle_button');?>'
  if (isDisplayButton == 1) {
    jQuery('.njt-nofi-button').show()
    jQuery('.njt-nofi-content').css({
      'padding': '10px 30px'
    })
  } else {
    jQuery('.njt-nofi-button').hide()
    jQuery('.njt-nofi-content').css({
      'padding': '15px 30px'
    })
  }

  var presetColor = '<?php echo get_theme_mod( 'njt_nofi_preset_color');?>'
  
    if (presetColor == '6') {
      jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
        'color': '#2962ff'
      })
    } else if (presetColor == '7') {
      jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
        'color': '#1919cf'
      })
    } else {
      console.log(presetColor)
      jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
        'color': '#ffffff'
      })
    }
</script>
