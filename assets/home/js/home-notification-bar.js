const homeNotificationBar = {
  setPaddingTop() {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    jQuery('body').css({
      'padding-top': barHeight,
      '-webkit-transition': 'padding-top 1s',
      'transition': 'padding-top 1s'
    })
    if (jQuery('#wpadminbar').length > 0) {
      const wpadminbarHeight = jQuery('#wpadminbar').outerHeight();
      jQuery('.njt-nofi-container').css('top', wpadminbarHeight)
    } else {
      jQuery('.njt-nofi-container').css('top', '0px')
    }
  },

  actionButtonClose() {
    jQuery(".njt-nofi-container .njt-nofi-close-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('.njt-nofi-notification-bar').animate({ top: -barHeight }, 1000)
      jQuery('body').css({
        'padding-top': 0,
        '-webkit-transition': 'padding-top 1s',
        'transition': 'padding-top 1s'
      })
    })

    jQuery(".njt-nofi-container .njt-nofi-toggle-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('.njt-nofi-notification-bar').animate({ top: -barHeight }, 1000)
      jQuery('.njt-nofi-display-toggle').css({
        'display': 'block',
        'top': 0
      })
      jQuery('body').css({
        'padding-top': 0,
        '-webkit-transition': 'padding-top 1s',
        'transition': 'padding-top 1s'
      })
    })

    jQuery(".njt-nofi-display-toggle").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').css({
        'padding-top': barHeight,
        '-webkit-transition': 'padding-top 1s',
        'transition': 'padding-top 1s'
      })
      jQuery('.njt-nofi-notification-bar').animate({ top: 0 }, 1000)
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