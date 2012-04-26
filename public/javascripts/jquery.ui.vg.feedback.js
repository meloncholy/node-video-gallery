/**
* Feedback abstract class; used for suggesting name and contact forms (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.vgDialog.subclass("ui.vgFeedback",
{
	// Required: footerHeight
	options:
	{
		footerHeight: 0,

		footerHtml: null,
		showUrl: null, 	// URL from which to get dialog
		submitUrl: null, // URL to which to submit dialog
		clearUrl: false		// Change the URL on closing?
	},

	_init: function ()
	{
		this.options.footerHtml = this.element.html();
	},

	// this = class
	_showAjax: function (data)
	{
		var _this = this;
		var op = this.options;

		this.options.oldTitle = document.title;

		data = typeof data == "object" ? data : $.parseJSON(data);
		document.title = data.title;

		this.element
		.html(data.html)
		.validateForm()
		.find(op.submitClass)
		.click(function (e) { return _this._submitDialog(e); });

		$(op.closeClass)
		.click(function ()
		{
			_this.hide();
			return op.clearUrl;
		});

		this.slideFadeIn();
		return false;
	},

	// Event: this = class
	_submitDialog: function (e)
	{
		throw "Please implement _submitDialog() in subclass.";
	},

	// this = class
	_showSubmitResults: function (data)
	{
		var _this = this;
		var op = this.options;

		data = typeof data == "object" ? data : $.parseJSON(data);
		document.title = data.title;
		this.element
		.children(op.childClass)
		.fadeOut(op.fadeTime)
		.end()
		.html(data.html)
		.children(op.childClass)
		.fadeIn(op.fadeTime)
		.find(op.closeClass)
		.click(function ()
		{
			_this.hide();
			return op.clearUrl;
		});
	},

	// this = class
	show: function ()
	{
		var _this = this;

		$.post(this.options.showUrl, function (data) { _this._showAjax(data); });
	},

	// this = class
	slideFadeIn: function ()
	{
		// Add top so slide up animation works; remove later so footer stays at bottom of window on resize.
		this.element.css("top", this.element.offset().top + "px");
		this._super();
	},

	// Show footer again after hiding dialog
	// this = class
	slideOut: function ()
	{
		var op = this.options;
		var _this = this;

		if (op.visible)
		{
			this.element
			.animate({ top: $(window).height() - op.footerHeight + "px" }, op.slideTime, function () { _this.element.hide(); })
			.children(op.childClass)
			.fadeOut(op.fadeTime, function ()
			{
				_this.element
				.css("top", "")
				.html(op.footerHtml)
				.fadeIn(op.fadeTime);
			});

			op.visible = false;
		}
		else
		{
			this.element.fadeIn(op.fadeTime);
		}
	}
});