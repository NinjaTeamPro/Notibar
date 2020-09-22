<?php
  defined('ABSPATH') || exit;
  
?>

<div class="njt-nofi-container" style="<?php if($isPositionFix) { echo ( 'position: fixed'); } else {  echo ( 'position: absolute'); }?>">
  <div class="njt-nofi-notification-bar njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_attr($bgColorNotification)) ?>">
    <div class="njt-nofi-content njt-nofi-text-color njt-nofi-align-content" style="<?php echo esc_attr($contentWidth) ?>">
      <div class="njt-nofi-text njt-nofi-padding-content"><?php echo (get_theme_mod( 'njt_nofi_text', $this->valueDefault['text'] ))?></div>
      <div class="njt-nofi-button njt-nofi-padding-content" style="<?php if(!$isDisplayButton) { echo ('display: none');}?>">
          <a <?php if(get_theme_mod('njt_nofi_open_new_windown', $this->valueDefault['new_windown'])) {echo ("target='_blank'");}?>  href="<?php echo esc_url(get_theme_mod( 'njt_nofi_lb_url', $this->valueDefault['lb_url'] ))?>" class="njt-nofi-button-text njt-nofi-padding-content" style="<?php if($isDisplayButton) { echo ('background:' .esc_attr($lbColorNotification).';border-radius:5px');}?>"><?php echo esc_html(get_theme_mod( 'njt_nofi_lb_text', $this->valueDefault['lb_text']))?></a>
      </div>
      </div>
    <a href="javascript:void(0)" class="njt-nofi-toggle-button njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom"><span><img src="<?php echo(NJT_NOFI_PLUGIN_URL . 'assets/home/img/close.svg') ?>" alt="btn-close" class="njt-nofi-close-icon"></span></a>
    <a href="javascript:void(0)" class="njt-nofi-close-button njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom"><span><img src="<?php echo(NJT_NOFI_PLUGIN_URL . 'assets/home/img/close.svg') ?>" alt="btn-close" class="njt-nofi-close-icon"></span></a>
  </div>
  <div>
    <a href="javascript:void(0)" class="njt-nofi-display-toggle njt-nofi-text-color njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_attr($bgColorNotification)) ?>"><span><img src="<?php echo(NJT_NOFI_PLUGIN_URL . 'assets/home/img/close.svg') ?>" alt="btn-close" class="njt-nofi-display-toggle-icon"></span></a>
  </div>
</div>
<script> 
  var newValue = '<?php echo esc_html(get_theme_mod( 'njt_nofi_hide_close_button')); ?>'
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

  var isDisplayButton = '<?php echo esc_html(get_theme_mod( 'njt_nofi_handle_button'));?>'
  if (isDisplayButton == 1) {
    jQuery('.njt-nofi-button').show()
    jQuery('.njt-nofi-content').css({
      'padding': '10px 100px'
    })
  } else {
    jQuery('.njt-nofi-button').hide()
    // jQuery('.njt-nofi-content').css({
    //   'padding': '15px 30px'
    // })
  }

  var presetColor = '<?php echo esc_html(get_theme_mod( 'njt_nofi_preset_color'));?>'
  
  if (presetColor == '6') {
    jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
      'color': '#2962ff'
    })
  } else if (presetColor == '7') {
    jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
      'color': '#1919cf'
    })
  } else {
    jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
      'color': '#ffffff'
    })
  }

  var alignContent = '<?php echo esc_html(get_theme_mod( 'njt_nofi_alignment'));?>'

  if(alignContent == 'center') {
    jQuery(".njt-nofi-container .njt-nofi-align-content").css({
      'justify-content': 'center'
    })
  }

  if(alignContent == 'right') {
    jQuery(".njt-nofi-container .njt-nofi-align-content").css({
      'justify-content': 'flex-end'
    })
  }

  if(alignContent == 'left') {
    jQuery(".njt-nofi-container .njt-nofi-align-content").css({
      'justify-content': 'flex-start'
    })
  }

  if(alignContent == 'space_around') {
    jQuery(".njt-nofi-container .njt-nofi-align-content").css({
      'justify-content': 'space-around'
    })
  }

</script>
