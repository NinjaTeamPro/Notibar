const homeNotificationBar = {
  setPaddingTop() {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    console.log(barHeight);
    if (wpData.isPositionFix) {
      jQuery('body').css({
        'padding-top': barHeight,
        '-webkit-transition': 'padding-top 1s',
        'transition': 'padding-top 1s'
      })
    }
    if (jQuery('#wpadminbar').length > 0) {
      jQuery('.njt-nofi-container').css('top', '32px')
    } else {
      jQuery('.njt-nofi-container').css('top', '0px')
    }
  },

  actionButtonClose() {
    jQuery(".njt-nofi-close-button").on("click", function (e) {
      jQuery('.njt-nofi-notification-bar').hide(1000)
      jQuery('body').css({
        'padding-top': 0,
        '-webkit-transition': 'padding-top 1s',
        'transition': 'padding-top 1s'
      })
    })

    jQuery(".njt-nofi-toggle-button").on("click", function (e) {
      if (wpData.isPositionFix || jQuery('#wpadminbar').length == 0) {
        jQuery('.njt-nofi-notification-bar').hide(1000);
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'block',
          'top': 0
        })
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      } else {
        jQuery('.njt-nofi-notification-bar').hide(1000);
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'block',
          'top': '32px'
        })
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      }
    })

    jQuery(".njt-nofi-display-toggle").on("click", function (e) {
      if (wpData.isPositionFix) {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery('body').css({
          'padding-top': barHeight,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
        jQuery('.njt-nofi-notification-bar').show(1000);
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'none',
          'top': 0,
        })
      } else {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery('body').css({
          'padding-top': barHeight,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
        jQuery('.njt-nofi-notification-bar').show(1000);
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'none',
          'top': 0
        })
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      }
    })
  }
}

jQuery(document).ready(() => {
  homeNotificationBar.setPaddingTop();
  homeNotificationBar.actionButtonClose();
})