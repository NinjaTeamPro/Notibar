const homeNotificationBar = {
  setPaddingTop() {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    jQuery('#wpadminbar').css({
      'position': 'fixed'
    })

  },
  setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  },
  getCookie(cname) {
    const name = cname + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  },
  hideBarWithCookie() {
    const valueCookie = homeNotificationBar.getCookie('njt-close-notibar')
    const hideCloseButton = wpData.hideCloseButton
    if (valueCookie == 'true' && !wpData.is_customize_preview && hideCloseButton == 'close_button') {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').css({ 'padding-top': -barHeight })
      jQuery('body').css({
        'position': 'relative',
      })
      jQuery('.njt-nofi-container').remove();
    }
  },
  actionButtonClose() {
    //Option Close
    jQuery(".njt-nofi-container .njt-nofi-close-button").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      const wpAdminBarHeight = jQuery('#wpadminbar').length > 0  ? jQuery('#wpadminbar').outerHeight() : 0 ;
      const a = wpAdminBarHeight - barHeight
      jQuery('body').animate({ 'padding-top': 0 }, 1000)
      jQuery('body').css({
        'position': 'relative',
      })
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        jQuery('.njt-nofi-container').animate({ top: a + "px" }, 1000, function() {
          jQuery('.njt-nofi-container .njt-nofi-notification-bar').hide();
        })
      }
      if (jQuery(".njt-nofi-container").css('position') == 'absolute') {
        jQuery('.njt-nofi-container').animate({ top: -barHeight + "px" }, 1000, function() {
          jQuery('.njt-nofi-container .njt-nofi-notification-bar').hide();
        })
      }
      //set cookie
      homeNotificationBar.setCookie('njt-close-notibar', 'true', 1)
      if(wpData.wp_get_theme == 'Essentials') {
        if (jQuery('.admin-bar').length > 0) {
          jQuery('body.admin-bar #masthead.pix-header').css({
            'top': '32px'
          })
        } else {
          jQuery('body #masthead.pix-header').css({
            'top': 0
          })
        }
      }

      if(wpData.wp_get_theme == 'Nayma'){
        jQuery('.njt-nofi-notification-bar').addClass('njt-nofi-toggle-close');

        if (jQuery('.admin-bar').length > 0) {
          jQuery('body.admin-bar #masthead .fixed-header').css({
            'top': '32px'
          })
        } else {
          jQuery('body #masthead .fixed-header').css({
            'top': 0
          })
        }
      }


    })


    //Option Toggle Close
    jQuery(".njt-nofi-container .njt-nofi-toggle-button").on("click", function (isCloaseBar) {
      
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      const wpAdminBarHeight = jQuery('#wpadminbar').length > 0  ? jQuery('#wpadminbar').outerHeight() : 0
      const a = wpAdminBarHeight - barHeight
      jQuery('body').animate({ 'padding-top': 0 }, 1000)
      jQuery('body').css({
        'position': 'relative',
      })
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        jQuery('.njt-nofi-container').animate({ top: a + "px" }, 1000, function() {
          jQuery('.njt-nofi-container .njt-nofi-notification-bar').hide();
        })

        //Essentials Theme
        if(wpData.wp_get_theme == 'Essentials') {
          if (jQuery('.admin-bar').length > 0) {
            jQuery('body.admin-bar #masthead.pix-header').css({
              'top': '32px'
            })
          } else {
            jQuery('body #masthead.pix-header').css({
              'top': 0
            })
          }
        }

        if(wpData.wp_get_theme == 'Nayma'){
          jQuery('.njt-nofi-notification-bar').addClass('njt-nofi-toggle-close');

          if (jQuery('.admin-bar').length > 0) {
            jQuery('body.admin-bar #masthead .fixed-header').css({
              'top': '32px'
            })
          } else {
            jQuery('body #masthead .fixed-header').css({
              'top': 0
            })
          }
        }
      }

      if (jQuery(".njt-nofi-container").css('position') == 'absolute') {
        jQuery('.njt-nofi-container').animate({ top: -barHeight + "px" }, 1000, function() {
          jQuery('.njt-nofi-container .njt-nofi-notification-bar').hide();
        })
      }

      jQuery('.njt-nofi-display-toggle').css({
        'display': 'block',
        'top': barHeight,
      })
    })

    //Option Toggle Opent
    jQuery(".njt-nofi-display-toggle").on("click", function (e) {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').animate({ 'padding-top': barHeight }, 1000)
      jQuery('.njt-nofi-display-toggle').css({
        'display': 'none',
        'top': 0,
      })
      if (jQuery(".njt-nofi-container").css('position') == 'fixed') {
        const wpAdminBarHeight = jQuery('#wpadminbar').length > 0  ? jQuery('#wpadminbar').outerHeight() : 0;
        jQuery('.njt-nofi-container .njt-nofi-notification-bar').show();
        jQuery('.njt-nofi-container').animate({ top: wpAdminBarHeight }, 1000)

        //Essentials Theme
        if(wpData.wp_get_theme == 'Essentials') {
          if (jQuery('.admin-bar').length > 0) {
            jQuery('body.admin-bar #masthead.pix-header').css({
              'top': barHeight + 32
            })
          } else {
            jQuery('body #masthead.pix-header').css({
              'top': barHeight
            })
          }
        }

        if(wpData.wp_get_theme == 'Nayma'){
          jQuery('.njt-nofi-notification-bar').removeClass('njt-nofi-toggle-close');
          if (jQuery('.admin-bar').length > 0) {
            jQuery('body.admin-bar #masthead .fixed-header').css({
              'top': barHeight + 32
            })
          } else {
            jQuery('body #masthead .fixed-header').css({
              'top': barHeight
            })
          }
        }
      }

      if (jQuery(".njt-nofi-container").css('position') == 'absolute') {
        jQuery('.njt-nofi-container .njt-nofi-notification-bar').show();
        jQuery('.njt-nofi-container').animate({ top: 0 }, 1000)
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

    const textButtonColor = wpData.textButtonColor

    if(textButtonColor) {
      jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
        'color': textButtonColor
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

    //setPositionBar
    homeNotificationBar.setPositionBar()
  },
  windownResizeforCustomize() {
    jQuery(window).on('resize', function () {
      const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
      jQuery('body').css({
        'padding-top': barHeight,
        'position': 'relative'
      })
    });
  },
  setPositionBar() {
    const isPositionFix = wpData.isPositionFix
    const wpAdminBarHeight = jQuery('#wpadminbar').length > 0  ? jQuery('#wpadminbar').outerHeight() : 0
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
  },
  supportEssentialsTheme() {
    jQuery(window).scroll(function() {
      if(homeNotificationBar.getCookie('njt-close-notibar') != 'true') {
        const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        if (jQuery('.admin-bar').length > 0) {
          jQuery('body.admin-bar #masthead.pix-header.is-scroll').css({
            'top': barHeight + 32
          })
        } else {
          jQuery('body #masthead.pix-header.is-scroll').css({
            'top': barHeight
          })
        }
      }else {
        if (jQuery('.admin-bar').length > 0) {
          jQuery('body.admin-bar #masthead.pix-header.is-scroll').css({
            'top': '32px'
          })
        } else {
          jQuery('body #masthead.pix-header.is-scroll').css({
            'top': 0
          })
        }
      }
    });
  },
  supportEnfoldTheme() {
    if(wpData.wp_get_theme == 'Enfold' && jQuery(".njt-nofi-container").css('position') == 'absolute'){
      jQuery(window).bind('mousewheel', function(event) {
        console.log(wpData.wp_get_theme);
        if (event.originalEvent.wheelDelta < 0) {
          if(jQuery('.admin-bar').length > 0) {
            jQuery('body header.header-scrolled').css({
              'top': '32px'
            })
          } else {
            jQuery('body header.header-scrolled').css({
              'top': 0
            })
          }
        } else {
          jQuery('body header.av_header_border_disabled').css({
            'top': 'unset'
          })
          if(jQuery('.admin-bar').length > 0) {
            jQuery('body header.header-scrolled').css({
              'top': '32px'
            })
          } else {
            jQuery('body header.header-scrolled').css({
              'top': 0
            })
          }
        }
      });
    }
  },
  supportNaymaTheme() {
    if(wpData.wp_get_theme == 'Nayma' && jQuery(".njt-nofi-container").css('position') == 'fixed'){
      jQuery(window).bind('mousewheel', function(event) {
        let barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
        if(jQuery('.njt-nofi-notification-bar').hasClass('njt-nofi-toggle-close')){
          barHeight = 0
        }
        
        if (event.originalEvent.wheelDelta < 0) {
          if(jQuery('.admin-bar').length > 0) {
            jQuery('body header .fixed-header').css({
              'top': barHeight + 32
            })
          } else {
            jQuery('body header .fixed-header').css({
              'top': barHeight
            })
          }
        }
      });
    }
  }
}

jQuery(document).ready(() => {
  homeNotificationBar.hideBarWithCookie();
  homeNotificationBar.setPaddingTop();
  homeNotificationBar.actionButtonClose();
  homeNotificationBar.customStyleBar();
  homeNotificationBar.supportEnfoldTheme();
  homeNotificationBar.supportNaymaTheme();
  if (wpData.is_customize_preview) {
    homeNotificationBar.windownResizeforCustomize()
  }
  if(wpData.wp_get_theme == 'Essentials') {
    const barHeight = jQuery('.njt-nofi-notification-bar').outerHeight();
    if(wpData.hideCloseButton == 'close_button') {
      if(wpData.isPositionFix) {
        homeNotificationBar.supportEssentialsTheme();
      }
    } else {
      if(wpData.isPositionFix) {
        if(jQuery('.admin-bar').length > 0) {
          jQuery('body.admin-bar header#masthead').css({
            'top': barHeight + 32
          })
        } else {
          jQuery('body header#masthead').css({
            'top': barHeight
          })
        }
      }
    }
    if(!wpData.isPositionFix) {
      jQuery(window).bind('mousewheel', function(event) {
        if (event.originalEvent.wheelDelta < 0) {
          jQuery('body.admin-bar #masthead.pix-header.is-scroll').css({
            'top': '32px'
          })
        } else {
          jQuery('body.admin-bar #masthead.pix-header').css({
            'top': '0'
          })
          jQuery('body.admin-bar #masthead.pix-header.is-scroll').css({
            'top': '32px'
          })
        }
      });
    }
  }
})
