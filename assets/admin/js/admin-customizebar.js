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
})(jQuery);
