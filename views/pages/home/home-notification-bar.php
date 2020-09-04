<?php
  defined('ABSPATH') || exit;
?>
<div class="njt-nofi-container" style="<?php if($isPositionFix) { echo ( 'position: fixed'); } else {  echo ( 'position: absolute'); }?>">
  <div class="njt-nofi-notification-bar njt-nofi-bgcolor-notification">
    <div class="njt-nofi-content njt-nofi-text-color" style="<?php echo esc_html($contentWidth) ?>">
      <div class="njt-nofi-text"><?php echo get_theme_mod( 'njt_nofi_text', $this->valueDefault['text'] )?></div>
      <div class="njt-nofi-button" 
      style="<?php if($isLinkStyleButton) {
        echo ('padding: 5px 10px'.
              ';background:' .esc_html($lbColorNotification).
              ';border-radius:5px'
              );
        }?>">
          <a href="<?php echo esc_html(get_theme_mod( 'njt_nofi_lb_url', $this->valueDefault['lb_url'] ))?>" class="njt-nofi-button-text" style="<?php if($isLinkStyleButton) {echo('color: #ffff');}else {echo('color:'. esc_html($lbColorNotification));}  ?>"><?php echo esc_html(get_theme_mod( 'njt_nofi_lb_text', $this->valueDefault['lb_text']))?></a>
      </div>
    </div>
    <a href="javascript:void(0)" class="njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom <?php echo esc_html($typeButton)?>" style="color:#fffff;"><span>+</span></a>
    
  </div>
  <div>
    <a href="javascript:void(0)" class="njt-nofi-display-toggle njt-nofi-text-color njt-nofi-bgcolor-notification" ><span>+</span></a>
  </div>
</div>