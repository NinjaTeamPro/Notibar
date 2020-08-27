const adminNotificationBar = {
  setPaddingTop() {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    console.log(barHeight);
    if (wpData.isPositionFix) {
      jQuery('body').css('padding-top', barHeight)
    }
    if (jQuery('#wpadminbar').length > 0) {
      jQuery('.njt-nofi-container').css('top', '32px')
    } else {
      jQuery('.njt-nofi-container').css('top', '0px')
    }
  }
}

jQuery(document).ready(() => {
  //jQuery("#toplevel_page_njt_nofi_NotificationBar a.toplevel_page_njt_nofi_NotificationBar").attr('href', 'http://localhost/wp/test2/wp-admin/customize.php?autofocus[panel]=njt_nofi_customNoti')
  adminNotificationBar.setPaddingTop();
})