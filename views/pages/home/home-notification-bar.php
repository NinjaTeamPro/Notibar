<?php
  defined('ABSPATH') || exit;
  
?>
<div class="njt-nofi-container-content">
<div class="njt-nofi-container" style="<?php if($isPositionFix) { echo ( 'position: fixed'); } else {  echo ( 'position: '); }?>">
  <div class="njt-nofi-notification-bar njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_attr($bgColorNotification)) ?>">
    <div class="njt-nofi-content njt-nofi-text-color njt-nofi-align-content" style="<?php echo esc_attr($contentWidth) ?>">
      <div class="njt-nofi-text njt-nofi-padding-content"><?php echo (get_theme_mod( 'njt_nofi_text', $this->valueDefault['text'] ))?></div>
      <div class="njt-nofi-button njt-nofi-padding-content" style="<?php if(!$isDisplayButton) { echo ('display: none');}?>">
          <a <?php if(get_theme_mod('njt_nofi_open_new_windown', $this->valueDefault['new_windown'])) {echo ("target='_blank'");}?>  href="<?php echo esc_url(get_theme_mod( 'njt_nofi_lb_url', $this->valueDefault['lb_url'] ))?>" class="njt-nofi-button-text njt-nofi-padding-content" style="<?php if($isDisplayButton) { echo ('background:' .esc_attr($lbColorNotification).';border-radius:5px');}?>"><?php echo esc_html(get_theme_mod( 'njt_nofi_lb_text', $this->valueDefault['lb_text']))?></a>
      </div>
      </div>
    <a href="javascript:void(0)" class="njt-nofi-toggle-button njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 386.667 386.667" style="enable-background:new 0 0 512 512" xml:space="preserve" class="njt-nofi-close-icon"><g><path xmlns="http://www.w3.org/2000/svg" d="m386.667 45.564-45.564-45.564-147.77 147.769-147.769-147.769-45.564 45.564 147.769 147.769-147.769 147.77 45.564 45.564 147.769-147.769 147.769 147.769 45.564-45.564-147.768-147.77z" fill="#ffffff" data-original="#000000" style="" class=""/></g></svg>
      </span>
    </a>
    <a href="javascript:void(0)" class="njt-nofi-close-button njt-nofi-hide njt-nofi-text-color njt-nofi-hide-admin-custom">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 386.667 386.667" style="enable-background:new 0 0 512 512" xml:space="preserve" class="njt-nofi-close-icon"><g><path xmlns="http://www.w3.org/2000/svg" d="m386.667 45.564-45.564-45.564-147.77 147.769-147.769-147.769-45.564 45.564 147.769 147.769-147.769 147.77 45.564 45.564 147.769-147.769 147.769 147.769 45.564-45.564-147.768-147.77z" fill="#ffffff" data-original="#000000" style="" class=""/></g></svg>
      </span>
    </a>  
  </div>
  <div>
    <a href="javascript:void(0)" class="njt-nofi-display-toggle njt-nofi-text-color njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_attr($bgColorNotification)) ?>">
      <span>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 386.667 386.667" style="enable-background:new 0 0 512 512" xml:space="preserve" class="njt-nofi-display-toggle-icon"><g><path xmlns="http://www.w3.org/2000/svg" d="m386.667 45.564-45.564-45.564-147.77 147.769-147.769-147.769-45.564 45.564 147.769 147.769-147.769 147.77 45.564 45.564 147.769-147.769 147.769 147.769 45.564-45.564-147.768-147.77z" fill="#ffffff" data-original="#000000" style="" class=""/></g></svg>
      </span>
    </a>
  </div>
</div>
</div>

