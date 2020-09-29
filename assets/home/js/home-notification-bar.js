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
  },
  customStyleBar() {
    const newValue = wpData.hideCloseButton
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

    const isDisplayButton = wpData.isDisplayButton
    if (isDisplayButton == 1) {
      jQuery('.njt-nofi-button').show()
      jQuery('.njt-nofi-content').css({
        'padding': '10px 100px'
      })
    } else {
      jQuery('.njt-nofi-button').hide()
    }

    const presetColor = wpData.presetColor

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

    const alignContent = wpData.alignContent

    if (alignContent == 'center') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'center'
      })
    }

    if (alignContent == 'right') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'flex-end'
      })
    }

    if (alignContent == 'left') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'flex-start'
      })
    }

    if (alignContent == 'space_around') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'space-around'
      })
    }

    const textColorNotification = wpData.textColorNotification
    jQuery(".njt-nofi-container .njt-nofi-text-color").css({
      'color': textColorNotification
    })
  }
}

jQuery(document).ready(() => {
  homeNotificationBar.setPaddingTop();
  homeNotificationBar.actionButtonClose();
  homeNotificationBar.customStyleBar()
})