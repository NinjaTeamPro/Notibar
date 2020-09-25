const homeNotificationBar = {
  setPaddingTop() {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    jQuery('.njt-nofi-container-content').css({
      'height': barHeight,
    })
  },

  actionButtonClose() {
    jQuery(".njt-nofi-container .njt-nofi-close-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').animate({ top: -barHeight }, 1000)
      jQuery('body').css({
        'position': 'relative',
      })
    })

    jQuery(".njt-nofi-container .njt-nofi-toggle-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').animate({ top: -barHeight }, 1000)
      jQuery('body').css({
        'position': 'relative',
      })
      jQuery('.njt-nofi-display-toggle').css({
        'display': 'block',
        'top': barHeight,
      })
    })

    jQuery(".njt-nofi-display-toggle").on("click", function (e) {
      jQuery('body').animate({ top: 0 }, 1000)
      jQuery('.njt-nofi-display-toggle').css({
        'display': 'none',
        'top': 0,
      })
    })
  }
}

jQuery(document).ready(() => {
  homeNotificationBar.setPaddingTop();
  homeNotificationBar.actionButtonClose();
})