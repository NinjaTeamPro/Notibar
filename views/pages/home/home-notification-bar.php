<?php
  defined('ABSPATH') || exit;
  $dataDisplay = array(
    'is_home' => is_home(),
    'is_page' => is_page(),
    'is_single' => is_single(),
    'id_page' => get_the_ID()
  );
?>
<input type="hidden" id="njt_nofi_checkDisplayReview" name="njt_nofi_checkDisplayReview" value='<?php echo (json_encode( $dataDisplay ))?>'>
<div class="njt-nofi-container" style="<?php if($isPositionFix) { echo ( 'position: fixed'); } else {  echo ( 'position: absolute'); }?>">
  <div class="njt-nofi-notification-bar njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_html($bgColorNotification)) ?>">
    <div class="njt-nofi-content njt-nofi-text-color" style="<?php echo esc_html($contentWidth) ?>">
      <div class="njt-nofi-text"><?php echo get_theme_mod( 'njt_nofi_text', $this->valueDefault['text'] )?></div>
      <div class="njt-nofi-button" 
      style="<?php if($isLinkStyleButton) {
        echo ('background:' .esc_html($lbColorNotification).
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