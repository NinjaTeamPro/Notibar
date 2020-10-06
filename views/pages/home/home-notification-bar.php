<?php
  defined('ABSPATH') || exit;
  $textContent = '';
  $buttonText = '';
  $buttonUrl = '';
  $isNewWindown = false;
  $isDisplayButton = false;

  if(wp_is_mobile() && get_theme_mod('njt_nofi_content_mobile', 0)) {
    $textContent = get_theme_mod('njt_nofi_text_mobile', $this->valueDefault['text_mobile']);
    $buttonText = get_theme_mod('njt_nofi_lb_text_mobile', $this->valueDefault['lb_text_mobile']);
    $buttonUrl = get_theme_mod('njt_nofi_lb_url_mobile', $this->valueDefault['lb_url_mobile']);
    $isNewWindown = get_theme_mod('njt_nofi_open_new_windown_mobile', $this->valueDefault['new_windown_mobile']);
    $isDisplayButton = get_theme_mod('njt_nofi_handle_button_mobile', 1);
  } else {
    $textContent = get_theme_mod('njt_nofi_text', $this->valueDefault['text']);
    $buttonText = get_theme_mod('njt_nofi_lb_text', $this->valueDefault['lb_text']);
    $buttonUrl = get_theme_mod('njt_nofi_lb_url', $this->valueDefault['lb_url']);
    $isNewWindown = get_theme_mod('njt_nofi_open_new_windown', $this->valueDefault['new_windown']);
    $isDisplayButton = get_theme_mod('njt_nofi_handle_button', 1);
  }
?>
<div class="njt-nofi-container-content">
<div class="njt-nofi-container" >
  <div class="njt-nofi-notification-bar njt-nofi-bgcolor-notification" style="<?php echo('background:'.esc_attr($bgColorNotification)) ?>">
    <div class="njt-nofi-content njt-nofi-text-color njt-nofi-align-content" style="<?php echo esc_attr($contentWidth) ?>">
      <div class="njt-nofi-text njt-nofi-padding-content"><?php echo ($textContent)?></div>
      <div class="njt-nofi-button njt-nofi-padding-content " style="<?php if(!$isDisplayButton) { echo ('display: none');}?>">
          <a <?php if($isNewWindown) {echo ("target='_blank'");}?>  href="<?php echo esc_url($buttonUrl)?>" class="njt-nofi-button-text njt-nofi-padding-content" style="<?php if($isDisplayButton) { echo ('background:' .esc_attr($lbColorNotification).';border-radius:3px');}?>"><?php echo esc_html($buttonText)?></a>
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


