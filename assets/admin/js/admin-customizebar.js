(function ($) {
  // Option Alignment
  wp.customize("njt_nofi_alignment", function (value) {
    value.bind(function (to) {
      if (to == 'center') {
        jQuery(".njt-nofi-container .njt-nofi-align-content").css({
          'justify-content': 'center'
        })
      }

      if (to == 'right') {
        jQuery(".njt-nofi-container .njt-nofi-align-content").css({
          'justify-content': 'flex-end'
        })
      }

      if (to == 'left') {
        jQuery(".njt-nofi-container .njt-nofi-align-content").css({
          'justify-content': 'flex-start'
        })
      }

      if (to == 'space_around') {
        jQuery(".njt-nofi-container .njt-nofi-align-content").css({
          'justify-content': 'space-around'
        })
      }
    })
  })
  // Hide/Close Button (No button, Toggle button, Close button)
  wp.customize("njt_nofi_hide_close_button", function (value) {
    value.bind(function (newValue, oldValue) {
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

      jQuery('body').animate({ top: 0 }, 1000)
      jQuery('.njt-nofi-display-toggle').css({
        'display': 'none',
        'top': 0,
      })
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
        jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)
      }
    });
  });

  //Content Width (px)
  wp.customize("njt_nofi_content_width", function (value) {
    value.bind(function (to) {
      if (to) {
        jQuery(".njt-nofi-notification-bar .njt-nofi-content").css({
          'width': to + 'px',
        })
      } else {
        jQuery(".njt-nofi-notification-bar .njt-nofi-content").css({
          'width': '100%',
        })
      }
    });
  });

  //Position Type
  wp.customize("njt_nofi_position_type", function (value) {
    value.bind(function (to) {
      if (to == 'fixed') {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery(".njt-nofi-container").css({
          'position': 'fixed',
        })

      } else {
        jQuery(".njt-nofi-container").css({
          'position': 'absolute',
        })
      }
    });
  });

  /*Content option*/
  //Text
  wp.customize("njt_nofi_text", function (value) {
    value.bind(function (to) {
      jQuery('.njt-nofi-text').html(to);
    })
  })

  //Customize Button
  wp.customize("njt_nofi_handle_button", function (value) {
    value.bind(function (to) {
      const lbColorNotification = wp.customize.value('njt_nofi_lb_color')()
      if (to == 1) {
        jQuery('.njt-nofi-button').show()
        jQuery('.njt-nofi-button .njt-nofi-button-text').css({
          'background': lbColorNotification,
          'border-radius': '5px'
        })
      } else {
        jQuery('.njt-nofi-button').hide()
      }
    })
  })


  //Link/Button Text
  wp.customize("njt_nofi_lb_text", function (value) {
    value.bind(function (to) {
      jQuery('.njt-nofi-button-text').text(to);
    })
  })

  //Link/Button URL
  wp.customize("njt_nofi_lb_url", function (value) {
    value.bind(function (to) {
      jQuery('.njt-nofi-button-text').attr('href', to);
    })
  })

  //You want different content for mobile
  // wp.customize("njt_nofi_content_mobile", function (value) {
  //   value.bind(function (to) {
  //     if (to) {
  //       jQuery("#customize-control-njt_nofi_text_mobile_control").show();
  //     } else {
  //       jQuery("#customize-control-njt_nofi_text_mobile_control").hide();
  //     }
  //   })
  // })


  /*Style Option*/

  //Preset Color
  wp.customize("njt_nofi_preset_color", function (value) {
    value.bind(function (to) {
      if (to == '6') {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': '#2962ff'
        })
      } else if (to == '7') {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': '#1919cf'
        })
      }
    })
  })

  //Text Color
  wp.customize("njt_nofi_text_color", function (value) {
    value.bind(function (to) {
      jQuery(".njt-nofi-container .njt-nofi-text-color").css({
        'color': to
      })
    });
  });

  //Background Color
  wp.customize("njt_nofi_bg_color", function (value) {
    value.bind(function (to) {
      jQuery(".njt-nofi-container .njt-nofi-bgcolor-notification").css({
        'background': to
      })
    })
  })

  //Link/Button Color 
  wp.customize("njt_nofi_lb_color", function (value) {
    value.bind(function (to) {
      const presetColor = wp.customize.value('njt_nofi_preset_color')()
      jQuery(".njt-nofi-notification-bar .njt-nofi-button .njt-nofi-button-text").css({
        'background': to
      })

      if (presetColor != '6' && presetColor != '7') {
        console.log(presetColor)
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': '#ffffff'
        })
      }
    })
  })
  //Font Size (px)
  wp.customize("njt_nofi_font_size", function (value) {
    value.bind(function (to) {
      jQuery(".njt-nofi-notification-bar .njt-nofi-content").css({
        'font-size': to + 'px'
      })
    })
  })
  /* Display Option*/

  function checkDisplay(displayHome, displayPage, displayPosts, displayPageOrPostId) {
    const strCheckDisplayReview = jQuery('#njt_nofi_checkDisplayReview').attr('value')
    const arrCheckDisplayReview = JSON.parse(strCheckDisplayReview)
    const isDisplayHome = displayHome
    const isDisplayPage = displayPage
    const isDisplayPosts = displayPosts
    const isDisplayPageOrPostId = displayPageOrPostId
    const arrDisplayPageOrPostId = isDisplayPageOrPostId.split(',')

    if (isDisplayHome && arrCheckDisplayReview.is_home) {
      return true
    } else if (isDisplayPage && arrCheckDisplayReview.is_page) {
      return true
    } else if (isDisplayPosts && arrCheckDisplayReview.is_single) {
      return true
    } else if (jQuery.inArray(arrCheckDisplayReview.id_page.toString(), arrDisplayPageOrPostId) != -1) {
      return true
    }
    return false
  }


  wp.customize("njt_nofi_homepage", function (value) {
    value.bind(function (to) {
      const displayHome = to
      const displayPage = wp.customize.value('njt_nofi_pages')()
      const displayPosts = wp.customize.value('njt_nofi_posts')()
      const displayPageOrPostId = wp.customize.value('njt_nofi_pp_id')()
      const isDisplay = checkDisplay(displayHome, displayPage, displayPosts, displayPageOrPostId);
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      if (!isDisplay) {
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
          'display': 'none',
        })
      } else {
        jQuery('body').animate({ top: 0 }, 1000)
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'none',
          'top': 0,
        })
        if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
          const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
          jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)
        }
      }
    })
  })

  wp.customize("njt_nofi_pages", function (value) {
    value.bind(function (to) {
      const displayHome = wp.customize.value('njt_nofi_homepage')()
      const displayPage = to
      const displayPosts = wp.customize.value('njt_nofi_posts')()
      const displayPageOrPostId = wp.customize.value('njt_nofi_pp_id')()
      const isDisplay = checkDisplay(displayHome, displayPage, displayPosts, displayPageOrPostId);
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      if (!isDisplay) {
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
          'display': 'none',
        })
      } else {
        jQuery('body').animate({ top: 0 }, 1000)
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'none',
          'top': 0,
        })
        if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
          const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
          jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)
        }
      }
    })
  })

  wp.customize("njt_nofi_posts", function (value) {
    value.bind(function (to) {
      const displayHome = wp.customize.value('njt_nofi_homepage')()
      const displayPage = wp.customize.value('njt_nofi_pages')()
      const displayPosts = to
      const displayPageOrPostId = wp.customize.value('njt_nofi_pp_id')()
      const isDisplay = checkDisplay(displayHome, displayPage, displayPosts, displayPageOrPostId);
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      if (!isDisplay) {
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
          'display': 'none',
        })
      } else {
        jQuery('body').animate({ top: 0 }, 1000)
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'none',
          'top': 0,
        })
        if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
          const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
          jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)
        }
      }
    })
  })

  wp.customize("njt_nofi_pp_id", function (value) {
    value.bind(function (to) {
      const displayHome = wp.customize.value('njt_nofi_homepage')()
      const displayPage = wp.customize.value('njt_nofi_pages')()
      const displayPosts = wp.customize.value('njt_nofi_posts')()
      const displayPageOrPostId = to
      const isDisplay = checkDisplay(displayHome, displayPage, displayPosts, displayPageOrPostId);
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      if (!isDisplay) {
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
          'display': 'none',
        })
      } else {
        jQuery('body').animate({ top: 0 }, 1000)
        jQuery('.njt-nofi-display-toggle').css({
          'display': 'none',
          'top': 0,
        })
        if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
          const wpAdminBarHeight = jQuery('#wpadminbar').outerHeight();
          jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)
        }
      }
    })
  })

})(jQuery);
