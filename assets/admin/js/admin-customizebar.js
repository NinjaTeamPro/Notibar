(function ($) {



  wp.customize("njt_nofi_hide_close_button", function (value) {
    value.bind(function (newValue, oldValue) {
      let newButton = '';
      let oldButton = ''
      if (newValue == 'no_button') {
        newButton = 'njt-nofi-hide-button';
      }

      if (newValue == 'toggle_button') {
        newButton = 'njt-nofi-toggle-button';
      }

      if (newValue == 'close_button') {
        newButton = 'njt-nofi-close-button';
      }
      //oldValue
      if (oldValue == 'no_button') {
        oldButton = 'njt-nofi-hide-button';
      }

      if (oldValue == 'toggle_button') {
        oldButton = 'njt-nofi-toggle-button';
      }

      if (oldValue == 'close_button') {
        oldButton = 'njt-nofi-close-button';
      }

      jQuery('.njt-nofi-hide-admin-custom').removeClass(oldButton)
      jQuery('.njt-nofi-hide-admin-custom').addClass(newButton)
      jQuery('.njt-nofi-notification-bar').show(1000);
      //

      jQuery(".njt-nofi-close-button").on("click", function (e) {
        console.log('close button');
        jQuery('.njt-nofi-notification-bar').hide(1000)
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      })

      jQuery(".njt-nofi-toggle-button").on("click", function (e) {
        console.log('toggle button');
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
        console.log('open toggle button');
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
        // jQuery('body').css({
        //   'padding-top': barHeight,
        //   '-webkit-transition': 'padding-top 1s',
        //   'transition': 'padding-top 1s'
        // })
      } else {
        jQuery(".njt-nofi-container").css({
          'position': 'absolute',
        })
      }
    });
  });

  /*Content option*/
  //Link Style
  wp.customize("njt_nofi_link_style", function (value) {
    value.bind(function (to) {
      const lbColorNotification = wp.customize.value('njt_nofi_lb_color')()
      console.log(lbColorNotification);
      if (to == 'button') {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': '#ffffff'
        })
        jQuery(".njt-nofi-notification-bar .njt-nofi-button").css({
          'border-radius': '5px',
          'background': lbColorNotification
        })
      } else {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button").css({
          'border-radius': '',
          'background': ''
        })
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': lbColorNotification
        })
      }
    })
  })

  //Text
  wp.customize("njt_nofi_text", function (value) {
    value.bind(function (to) {
      jQuery('.njt-nofi-text').html(to);
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

  /*Style Option*/
  //Text Color
  wp.customize("njt_nofi_text_color", function (value) {
    value.bind(function (to) {
      var css = "";
      css +=
        ".njt-nofi-container .njt-nofi-text-color { color:" +
        to + '!important;}';
      jQuery("#button-hover-color-inline-css").text(css);
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
      const linkStyleButton = wp.customize.value('njt_nofi_link_style')()
      jQuery(".njt-nofi-notification-bar .njt-nofi-button").css({
        'background': to
      })
      if (linkStyleButton == 'button') {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': '#ffffff'
        })
      } else {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button").css({
          'border-radius': '',
          'background': ''
        })
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': to
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
      if (!isDisplay) {
        jQuery('.njt-nofi-notification-bar').hide(1000)
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      } else {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery('body').css({
          'padding-top': barHeight,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
        jQuery('.njt-nofi-notification-bar').show(1000);
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
      if (!isDisplay) {
        jQuery('.njt-nofi-notification-bar').hide(1000)
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      } else {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery('body').css({
          'padding-top': barHeight,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
        jQuery('.njt-nofi-notification-bar').show(1000);
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
      if (!isDisplay) {
        jQuery('.njt-nofi-notification-bar').hide(1000)
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      } else {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery('body').css({
          'padding-top': barHeight,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
        jQuery('.njt-nofi-notification-bar').show(1000);
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
      if (!isDisplay) {
        jQuery('.njt-nofi-notification-bar').hide(1000)
        jQuery('body').css({
          'padding-top': 0,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
      } else {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        jQuery('body').css({
          'padding-top': barHeight,
          '-webkit-transition': 'padding-top 1s',
          'transition': 'padding-top 1s'
        })
        jQuery('.njt-nofi-notification-bar').show(1000);
      }
    })
  })

})(jQuery);
