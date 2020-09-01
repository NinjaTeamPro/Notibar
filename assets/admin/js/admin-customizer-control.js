window.onload = function () {

  var selectBackgroundColor = new NjColorSelect({
    dom: document.getElementById('nj_color_select_bg'),
    customColors: {
      "golden drizzle": "#FCE9D2",
      "54545454": "#FFB5A4",
      "opal gardens": "#BA92B0",
      "lavanda": "#8F687B",
      "4b609e": "#4B609E"
    }
  });
  selectBackgroundColor.init();

  var selectTextColor = new NjColorSelect({
    dom: document.getElementById('nj_color_select_text'),
    customColors: {
      "golden drizzle": "#FCE9D2",
      "54545454": "#FFB5A4",
      "opal gardens": "#BA92B0",
      "lavanda": "#8F687B",
      "4b609e": "#4B609E"
    }
  });
  selectTextColor.init();

  var selectLbColor = new NjColorSelect({
    dom: document.getElementById('nj_color_select_lb'),
    customColors: {
      "golden drizzle": "#FCE9D2",
      "54545454": "#FFB5A4",
      "opal gardens": "#BA92B0",
      "lavanda": "#8F687B",
      "4b609e": "#4B609E"
    }
  });
  selectLbColor.init();

  //Start custom js
  jQuery('#nj_color_select_bg .nj_color_select').click(function () {
    jQuery('#nj_color_select_bg .nj_color_popup__item').each(function () {
      if (jQuery(this).attr('data-color-value') == jQuery('#_customize-input-njt_nofi_bg_color').val()) {
        jQuery(this).addClass('nj_color_popup__item--state-active-first-time')
      }
    });
  });

  jQuery('#nj_color_select_text .nj_color_select').click(function () {
    jQuery('#nj_color_select_text .nj_color_popup__item').each(function () {
      if (jQuery(this).attr('data-color-value') == jQuery('#_customize-input-njt_nofi_text_color').val()) {
        jQuery(this).addClass('nj_color_popup__item--state-active-first-time')
      }
    });
  });

  jQuery('#nj_color_select_lb .nj_color_select').click(function () {
    jQuery('#nj_color_select_lb .nj_color_popup__item').each(function () {
      if (jQuery(this).attr('data-color-value') == jQuery('#_customize-input-njt_nofi_lb_color').val()) {
        jQuery(this).addClass('nj_color_popup__item--state-active-first-time')
      }
    });
  });

  // End custom js
  function NjColorSelect(options) {
    var defaults = {
      dom: null,
      defaultColor: null,
      text: {
        title: 'Choose a color:',
        buttonOk: 'Ok',
        buttonCancel: 'Cancel',
        buttonBack: 'Back'
      },
      colors: {
        "red": {
          default: '#f44336',
          list: {
            "red-50": "#ffebee",
            "red-100": "#ffcdd2",
            "red-200": "#ef9a9a",
            "red-300": "#e57373",
            "red-400": "#ef5451",
            "red-500": "#f44437",
            "red-600": "#e53935",
            "red-700": "#d33030",
            "red-800": "#c62929",
            "red-900": "#b71d1d",
            "red-a100": "#ff8a80",
            "red-a200": "#ff5353",
            "red-a400": "#ff1845",
            "red-a700": "#d50101",
          }
        },
        "pink": {
          default: '#e91e63',
          list: {
            "pink-50": "#fce4ec",
            "pink-100": "#f8bbd0",
            "pink-200": "#f48fb1",
            "pink-300": "#f06292",
            "pink-400": "#ec407a",
            "pink-500": "#e91e63",
            "pink-600": "#d81b60",
            "pink-700": "#c2185b",
            "pink-800": "#ad1457",
            "pink-900": "#880e4f",
            "pink-a100": "#ff80ab",
            "pink-a200": "#ff4081",
            "pink-a400": "#f50057",
            "pink-a700": "#c51162",
          }
        },
        "purple": {
          default: '#9c27b0',
          list: {
            "purple-50": "#f3e5f5",
            "purple-100": "#e1bee7",
            "purple-200": "#ce93d8",
            "purple-300": "#ba68c8",
            "purple-400": "#ab47bc",
            "purple-500": "#9c27b0",
            "purple-600": "#8e24aa",
            "purple-700": "#7b1fa2",
            "purple-800": "#6a1b9a",
            "purple-900": "#4a148c",
            "purple-a100": "#ea80fc",
            "purple-a200": "#e040fb",
            "purple-a400": "#d500f9",
            "purple-a700": "#aa00ff",
          }
        },
        "deeppurple": {
          default: '#673ab7',
          list: {
            "deeppurple-50": "#ede7f6",
            "deeppurple-100": "#d1c4e9",
            "deeppurple-200": "#b39ddb",
            "deeppurple-300": "#9575cd",
            "deeppurple-400": "#7e57c2",
            "deeppurple-500": "#673ab7",
            "deeppurple-600": "#5e35b1",
            "deeppurple-700": "#512da8",
            "deeppurple-800": "#4527a0",
            "deeppurple-900": "#311b92",
            "deeppurple-a100": "#b388ff",
            "deeppurple-a200": "#7c4dff",
            "deeppurple-a400": "#651fff",
            "deeppurple-a700": "#6200ea",
          }
        },
        "indigo": {
          default: '#3f51b5',
          list: {
            "indigo-50": "#e8eaf6",
            "indigo-100": "#c5cae9",
            "indigo-200": "#9fa8da",
            "indigo-300": "#7986cb",
            "indigo-400": "#5c6bc0",
            "indigo-500": "#3f51b5",
            "indigo-600": "#3949ab",
            "indigo-700": "#303f9f",
            "indigo-800": "#283593",
            "indigo-900": "#1a237e",
            "indigo-a100": "#8c9eff",
            "indigo-a200": "#536dfe",
            "indigo-a400": "#3d5afe",
            "indigo-a700": "#304ffe",
          }
        },
        "green": {
          default: '#4caf50',
          list: {
            "indigo-50": "#e8f5e9",
            "indigo-100": "#c8e6c9",
            "indigo-200": "#a5d6a7",
            "indigo-300": "#81c784",
            "indigo-400": "#66bb6a",
            "indigo-500": "#4caf50",
            "indigo-600": "#43a047",
            "indigo-700": "#388e3c",
            "indigo-800": "#2e7d32",
            "indigo-900": "#1b5e20",
            "indigo-a100": "#b9f6ca",
            "indigo-a200": "#69f0ae",
            "indigo-a400": "#00e676",
            "indigo-a700": "#00c853",
          }
        },
        "black": '#000000'
      },
      customColors: {}
    }, st;
    if (options) {
      if (options.text) {
        defaults.text = Object.assign(defaults.text, options.text);
        options.text = defaults.text;
      }
      st = Object.assign(defaults, options);
    }
    st.colors = Object.assign(st.colors, st.customColors);
    if (!st.dom) return;
    //console.log(st);
    /*---- BEGIN INIT ----*/
    var controller = document.createElement('a'),
      picker = document.createElement('div'),
      title = document.createElement('div'),
      color_list = document.createElement('div'),
      color_list_holder_wrap = document.createElement('div'),
      color_list_holder = document.createElement('div'),
      color_item = document.createElement('div'),
      color_item_child = document.createElement('div'),
      button_wrap = document.createElement('div'),
      button_ok = document.createElement('button'),
      button_cancel = document.createElement('button'),
      button_back = document.createElement('button'),
      button_back_wrap = document.createElement('div'),
      old_value = {
        colorValue: null,
        colorName: null,
        selector: null,
      },
      current_select = null,
      current_palette = null,
      largest_total_item = Object.keys(st.colors).length,
      open_popup_animation_name = 'openPopup' + (Math.floor((Math.random() * 100000) + 1)),
      animation = {
        popup: {
          id: Math.floor((Math.random() * 100000) + 1),
          name: {}
        }
      };
    animation.popup.dom = document.createElement('style');
    animation.popup.name.open = 'openPopup' + animation.popup.id;
    animation.popup.name.close = 'closePopup' + animation.popup.id;
    animation.popup.template = '@keyframes ' + animation.popup.name.open + '{0%{width: 0px; height: 0px; opacity: 0;visibility: visible;}100%{width: %width%;height: %height%;opacity: 1;visibility: visible;}}@keyframes ' + animation.popup.name.close + '{0%{width: %width%;height: %height%;opacity: 1;visibility: visible;}100%{width: 0px; height: 0px; opacity: 0;visibility: visible;}}';
    animation.popup.has_appended = false;

    controller.href = 'javascript:void(0)';
    controller.className = 'nj_color_select';
    picker.className = 'nj_color_popup nj_color_popup--hidden';
    title.className = 'nj_color_popup__title';
    color_list.className = 'nj_color_popup__list';
    color_list_holder_wrap.className = 'nj_color_popup__list_holder_wrap';
    color_list_holder.className = 'nj_color_popup__list nj_color_popup__list--holder';
    color_item.className = 'nj_color_popup__item';
    button_back_wrap.className = 'nj_color_popup__item';
    color_item_child.className = 'nj_color_popup__item_child';
    color_item.appendChild(color_item_child);
    button_wrap.className = 'nj_color_popup__buttons';
    button_ok.type = 'button';
    button_ok.className = 'nj_color_popup__button nj_color_popup__button--ok';
    button_cancel.type = 'button';
    button_cancel.className = 'nj_color_popup__button nj_color_popup__button--cancel';
    button_back.type = 'button';
    button_back.className = 'nj_color_popup__button_back';
    title.appendChild(document.createTextNode(st.text.title));
    button_ok.innerHTML = st.text.buttonOk;
    button_cancel.innerHTML = st.text.buttonCancel;
    button_back.innerHTML = st.text.buttonBack;
    button_back_wrap.appendChild(button_back);

    //Setup color
    color_list_holder_wrap.appendChild(color_list);
    var timing_delay = 0;
    Object.keys(st.colors).forEach(function (key) {
      if (typeof st.colors[key] == 'string') {
        var item = create_item(key, st.colors[key]);
        item.childNodes[0].addEventListener('click', choose_color);
        item.childNodes[0].style.transitionDelay = timing_delay + 's';
        color_list.appendChild(item);
      } else {
        var d_color = (st.colors[key].default) ? st.colors[key].default : '',
          sub_list = document.createElement('div'),
          btn_back = button_back_wrap.cloneNode(true);
        sub_list.className = 'nj_color_popup__list nj_color_popup__list--sub';
        sub_list.appendChild(btn_back);
        btn_back.childNodes[0].addEventListener('click', function () { back_to_color_list(sub_list); });
        var sub_timing_delay = 0.03;
        Object.keys(st.colors[key].list).forEach(function (color_name) {
          var item = create_item(color_name, st.colors[key].list[color_name]);
          if (d_color == '') d_color = st.colors[key].list[color_name];
          sub_list.appendChild(item);
          item.childNodes[0].addEventListener('click', choose_color);
          item.childNodes[0].style.transitionDelay = sub_timing_delay + 's';
          sub_timing_delay += 0.03;
        });
        var item = create_item(key, d_color);
        color_list.appendChild(item);
        item.childNodes[0].addEventListener('click', function (e) { select_palette(sub_list) });
        item.childNodes[0].style.transitionDelay = timing_delay + 's';
        color_list_holder_wrap.appendChild(sub_list);
        if (Object.keys(st.colors[key].list).length + 1 > largest_total_item) largest_total_item = Object.keys(st.colors[key].list).length + 1;
      }
      timing_delay += 0.03;
    });

    //Create holder for color list
    for (var i = 0; i < largest_total_item; i++) {
      color_list_holder.appendChild(color_item.cloneNode(true));
    }

    //Create popup
    button_wrap.appendChild(button_cancel);
    button_wrap.appendChild(button_ok);
    picker.appendChild(title);
    picker.appendChild(color_list_holder_wrap);
    color_list_holder_wrap.appendChild(color_list_holder);
    picker.appendChild(button_wrap);
    /*---- END INIT ----*/

    /*---- BEGIN PRIVATE EVENT ----*/
    button_ok.addEventListener('click', close_popup);
    button_cancel.addEventListener('click', function () {
      if (old_value.colorValue) {
        st.dom.dataset.colorName = old_value.colorName;
        st.dom.dataset.colorValue = old_value.colorValue;
        choose_color({
          target: {
            parentNode: old_value.selector
          }
        });
      }
      close_popup();
    });
    controller.addEventListener('click', function () {
      if (picker.className.split(' ').indexOf('nj_color_popup--hidden') > -1) {
        open_popup();
      } else {
        close_popup();
      }
    });
    // Code for Chrome, Safari and Opera
    picker.addEventListener("webkitAnimationEnd", open_completed);
    picker.addEventListener("animationend", open_completed);

    //When click on the color circle
    document.body.addEventListener('click', function (e) {
      if (!is_in_dom(e.target, st.dom)) {
        close_popup();
      }
    });
    function choose_color(e) {
      var parent = e.target.parentNode;
      if (current_select) current_select.className = remove_class('nj_color_popup__item--state-active', current_select);
      jQuery('.nj_color_popup__item').removeClass('nj_color_popup__item--state-active-first-time')
      parent.className = add_class('nj_color_popup__item--state-active', parent);
      st.dom.dataset.colorValue = parent.dataset.colorValue;
      st.dom.dataset.colorName = parent.dataset.colorName;
      current_select = parent;
      var a = jQuery("#_customize-input-njt_nofi_bg_color").parent('#nj_color_select_bg').attr('data-color-value')
      var b = jQuery("#_customize-input-njt_nofi_text_color").parent('#nj_color_select_text').attr('data-color-value')
      var c = jQuery("#_customize-input-njt_nofi_lb_color").parent('#nj_color_select_lb').attr('data-color-value')
      if (a) {
        jQuery('#_customize-input-njt_nofi_bg_color').val(a).trigger('change')
      }
      if (b) {
        jQuery('#_customize-input-njt_nofi_text_color').val(b).trigger('change')
      }
      if (c) {
        jQuery('#_customize-input-njt_nofi_lb_color').val(c).trigger('change')
      }
    }
    //When click on the color circle has sub
    function select_palette(palette) {
      color_list.className = remove_class('nj_color_popup__list--visible', color_list);
      palette.className = add_class('nj_color_popup__list--visible', palette);
      current_palette = palette;
    }
    //When click on back button
    function back_to_color_list(palette) {
      color_list.className = add_class('nj_color_popup__list--visible', color_list);
      palette.className = remove_class('nj_color_popup__list--visible', palette);
      current_palette = null;
    }
    /*---- END PRIVATE EVENT ----*/

    /*---- BEGIN PRIVATE FUNCTION ----*/
    function create_item(color_name, color_value) {
      var new_item = color_item.cloneNode(true);
      new_item.dataset.colorName = color_name;
      new_item.dataset.colorValue = color_value;
      new_item.childNodes[0].innerHTML = color_name;
      new_item.childNodes[0].title = color_name;
      new_item.childNodes[0].style.backgroundColor = color_value;
      if (st.defaultColor && st.defaultColor == color_name) {
        st.dom.dataset.colorName = color_name;
        st.dom.dataset.colorValue = color_value;
        new_item.className = add_class('nj_color_popup__item--state-active', new_item);
        current_select = new_item;
      }
      return new_item;
    }
    function add_class(class_name, dom) {
      if (dom.className) {
        if (dom.className.split(' ').indexOf(class_name) > -1) {
          return dom.className;
        } else {
          return dom.className + ' ' + class_name;
        }
      } else {
        return class_name;
      }
    }
    function remove_class(class_name, dom) {
      if (dom.className) {
        if (dom.className.split(' ').indexOf(class_name) > -1) {
          var arr = dom.className.split(' ');
          arr.splice(arr.indexOf(class_name), 1);
          return arr.join(' ');
        } else {
          return dom.className;
        }
      } else {
        return dom.className;
      }
    }
    function is_in_dom(child, dom) {
      if (child != dom) {
        if (child.tagName == 'BODY') {
          return false;
        } else {
          return is_in_dom(child.parentNode, dom);
        }
      } else {
        return true;
      }
    }
    function open_popup() {
      picker.className = remove_class('nj_color_popup--hidden', picker);
      if (typeof st.dom.dataset.colorName !== 'undefined') {
        old_value.colorName = st.dom.dataset.colorName;
        old_value.colorValue = st.dom.dataset.colorValue;
        old_value.selector = current_select;
      }
      if (animation.popup.has_appended == false) {
        animation.popup.dom.innerHTML = animation.popup.template
          .replace('%width%', window.getComputedStyle(picker).getPropertyValue('width'))
          .replace('%width%', window.getComputedStyle(picker).getPropertyValue('width'))
          .replace('%height%', window.getComputedStyle(picker).getPropertyValue('height'))
          .replace('%height%', window.getComputedStyle(picker).getPropertyValue('height'));
        document.body.appendChild(animation.popup.dom);
        animation.popup.has_appended = true;
      }
      picker.style.animationName = animation.popup.name.open;
    }
    function close_popup() {
      if (current_palette) back_to_color_list(current_palette);
      picker.className = add_class('nj_color_popup--hidden', picker);
      title.className = remove_class('nj_color_popup__title--show', title);
      button_wrap.className = remove_class('nj_color_popup__buttons--show', button_wrap);
      color_list.className = remove_class('nj_color_popup__list--visible', color_list);
      picker.style.animationName = animation.popup.name.close;
    }
    function open_completed() {
      if (!picker.classList.contains('nj_color_popup--hidden')) {
        title.className = add_class('nj_color_popup__title--show', title);
        button_wrap.className = add_class('nj_color_popup__buttons--show', button_wrap);
        color_list.className = add_class('nj_color_popup__list--visible', color_list);
      }
    }

    function convertColor(color, format) {
      console.log(color)
      console.log(format)
      switch (format) {
        case 'rgb': return convertHexToRGB(color); break;
        default: return color; break;
      }
    }

    function convertHexToRGB(color) {
      console.log(color)
      console.log('a')
      return 'rgb(' + (parseInt(color.slice(1, 3), 16)) + ',' + (parseInt(color.slice(3, 5), 16)) + ',' + (parseInt(color.slice(5, 7), 16)) + ')';
    }
    /*---- END PRIVATE FUNCTION ----*/

    /*---- BEGIN PUCLIC ----*/
    return {
      init: function () {
        st.dom.className = add_class('nj_color_select__wrap', st.dom);
        st.dom.appendChild(controller);
        st.dom.appendChild(picker);


      },
      getColor: function (format) {
        if (format) {
          console.log('1111111111111')
          console.log(convertColor(st.dom.dataset.colorValue, format));
          return {
            name: st.dom.dataset.colorName,
            value: convertColor(st.dom.dataset.colorValue, format)
          }
        } else {
          console.log('22222222222')
          console.log(st.dom.dataset.colorValue);
          return {
            name: st.dom.dataset.colorName,
            value: st.dom.dataset.colorValue,
          }
        }
      }
    }
    /*---- END PUCLIC ----*/
  }
}