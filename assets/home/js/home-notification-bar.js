const homeNotificationBar = {
  setPaddingTop() {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    jQuery('#wpadminbar').css({
      'position': 'fixed'
    })

  },

  actionButtonClose() {
    jQuery(".njt-nofi-container .njt-nofi-close-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').animate({ top: -barHeight }, 1000)
      jQuery('body').css({
        'position': 'relative',
      })
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
        const a = wpAdminBarHeight - barHeight
        jQuery('.njt-nofi-container').animate({ top: a + "px" }, 1000)
      }
    })

    jQuery(".njt-nofi-container .njt-nofi-toggle-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').animate({ top: -barHeight }, 1000)
      jQuery('body').css({
        'position': 'relative',
      })
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
        const a = wpAdminBarHeight - barHeight
        jQuery('.njt-nofi-container').animate({ top: a + "px" }, 1000)
      }
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
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
        jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)
      }
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
    const width = jQuery(window).width();
    if (alignContent == 'center') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'center'
      })

    }

    if (alignContent == 'right') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'flex-end'
      })
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'text-align': 'right',
        'padding': '10px 30px'
      })
    }

    if (alignContent == 'left') {
      jQuery(".njt-nofi-container .njt-nofi-align-content").css({
        'justify-content': 'flex-start'
      })
      if (width <= 480) {
        jQuery(".njt-nofi-container .njt-nofi-align-content").css({
          'text-align': 'left'
        })
      }
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

    const isPositionFix = wpData.isPositionFix
    const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    if (isPositionFix) {
      jQuery(".njt-nofi-container").css({
        'position': 'fixed',
        'top': wpAdminBarHeight || '0px'
      })
      jQuery('body').css({
        'padding-top': barHeight,
        'position': 'relative'
      })
    } else {
      jQuery(".njt-nofi-container").css({
        'position': 'absolute',
        'top': 0
      })
      jQuery('body').css({
        'padding-top': barHeight,
        'position': 'relative'
      })
    }
  }
}

jQuery(document).ready(() => {
  homeNotificationBar.setPaddingTop();
  homeNotificationBar.actionButtonClose();
  homeNotificationBar.customStyleBar()
})