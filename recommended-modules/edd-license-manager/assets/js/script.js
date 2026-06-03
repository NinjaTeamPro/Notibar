/* global jQuery */
jQuery(function ($) {
	var cfg = window.njtEddLicense || {};
	if (!cfg.ajaxurl || !cfg.nonce) {
		return;
	}
	var $wrap = $('.njt-edd-license');
	if (!$wrap.length) {
		return;
	}
	var slug = $wrap.data('slug');

	function showMsg(text, isError) {
		$('.njt-edd-message')
			.text(text)
			.css('color', isError ? '#c62828' : '#2e7d32')
			.show();
	}

	function run(action, extra, $btn) {
		var orig = $btn.text();
		$btn.prop('disabled', true).text(cfg.i18n.processing).addClass('updating-message');
		$.ajax({
			url: cfg.ajaxurl,
			method: 'POST',
			data: $.extend({ action: action, nonce: cfg.nonce, slug: slug }, extra || {}),
			success: function (r) {
				if (r && r.success) {
					// Reload so the server re-renders the masked key, badge and buttons.
					window.location.reload();
				} else {
					showMsg(r && r.data && r.data.message ? r.data.message : cfg.i18n.failed, true);
					$btn.prop('disabled', false).text(orig).removeClass('updating-message');
				}
			},
			error: function () {
				showMsg(cfg.i18n.failed, true);
				$btn.prop('disabled', false).text(orig).removeClass('updating-message');
			}
		});
	}

	$wrap.on('click', '.njt-edd-activate', function (e) {
		e.preventDefault();
		run('njt_edd_license_activate', { license: $wrap.find('.njt-edd-key').val() }, $(this));
	});
	$wrap.on('click', '.njt-edd-key-toggle', function (e) {
		e.preventDefault();
		var $btn = $(this);
		var $input = $btn.closest('.njt-edd-key-field').find('.njt-edd-key');
		var reveal = $input.attr('type') === 'password';
		$input.attr('type', reveal ? 'text' : 'password');
		$btn.attr('aria-pressed', reveal ? 'true' : 'false')
			.attr('aria-label', reveal ? cfg.i18n.hideKey : cfg.i18n.showKey)
			.find('.dashicons')
			.toggleClass('dashicons-visibility', !reveal)
			.toggleClass('dashicons-hidden', reveal);
	});
	$wrap.on('click', '.njt-edd-check', function (e) {
		e.preventDefault();
		run('njt_edd_license_check', {}, $(this));
	});
	$wrap.on('click', '.njt-edd-remove', function (e) {
		e.preventDefault();
		run('njt_edd_license_deactivate', {}, $(this));
	});

	$wrap.on('click', '.njt-edd-update-check', function (e) {
		e.preventDefault();
		var $btn = $(this);
		var orig = $btn.text();
		$btn.prop('disabled', true).text(cfg.i18n.processing).addClass('updating-message');
		$.ajax({
			url: cfg.ajaxurl,
			method: 'POST',
			data: { action: 'njt_edd_license_update_check', nonce: cfg.nonce, slug: slug },
			success: function (r) {
				if (r && r.success && r.data) {
					var d = r.data;
					var $m = $('.njt-edd-message').css('color', '#2e7d32').show();
					if (d.has_update) {
						$m.text(cfg.i18n.latest + ' ' + d.new_version + ' (' + d.current + ')');
						if (d.url) {
							$m.append(' ').append(
								$('<a/>', { href: d.url, target: '_blank', rel: 'noopener', text: cfg.i18n.changelog })
							);
						}
					} else {
						$m.text(cfg.i18n.upToDate);
					}
				} else {
					showMsg((r && r.data && r.data.message) || cfg.i18n.failed, true);
				}
			},
			error: function () { showMsg(cfg.i18n.failed, true); },
			complete: function () { $btn.prop('disabled', false).text(orig).removeClass('updating-message'); }
		});
	});
});
