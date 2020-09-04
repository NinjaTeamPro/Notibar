(function ($) {
  wp.customize("njt_nofi_text_color", function (value) {
    value.bind(function (to) {
      var css = "";
      css +=
        ".njt-nofi-container .njt-nofi-text-color { color:" +
        to + '!important;}';
      jQuery("#button-hover-color-inline-css").text(css);
    });
  });


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
          'padding': '5px 10px',
          'border-radius': '5px',
          'background': lbColorNotification
        })
      } else {
        jQuery(".njt-nofi-notification-bar .njt-nofi-button").css({
          'padding': '',
          'border-radius': '',
          'background': ''
        })
        jQuery(".njt-nofi-notification-bar .njt-nofi-button-text").css({
          'color': lbColorNotification
        })
      }
    })
  })

})(jQuery);
