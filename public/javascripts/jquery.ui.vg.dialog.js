/**
* Dialog abstract class (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.widget.subclass("ui.vgDialog",
{
	// Required: prettyLink
	options:
	{
		prettyLink: null, // URL fragment to prepend to video hash ('#!pretty-link/video-name')

		visible: false,
		padding: 150,
		childClass: ".ActiveVideo, .Content",
		otherChildClass: null,
		submitClass: "#submit",
		closeClass: ".Close",
		oldTitle: "",
		slideTime: 400,
		fadeTime: 400,
		slideVertically: true
	},

	show: function ()
	{
		throw "Please implement show() in subclass.";
	},

	hide: function ()
	{
		var op = this.options;

		if (op.visible && op.oldTitle != "") document.title = op.oldTitle;
		this.slideOut();
	},

	// Slide in dialog and fade in contents. 
	slideFadeIn: function (fade)
	{
		var _this = this;
		var op = this.options;

		if (typeof (fade) === "undefined") fade = true;

		if (!op.visible)
		{
			if (op.slideVertically)
			{
				this.element
				.css("top", $(window).height() + "px")
				.show()
				.animate({ top: "0" }, op.slideTime, function ()
				{
					if (fade) _this.fadeIn();
				});
			}
			else
			{
				this.element
				.css("left", $(window).width() + "px")
				.show()
				.animate({ left: "0" }, op.slideTime, function ()
				{
					if (fade) _this.fadeIn();
				});
			}
		}

		return this;
	},

	slideIn: function ()
	{
		this.slideFadeIn(false);
		return this;
	},

	// Fade in dialog contents
	fadeIn: function (fn)
	{
		var op = this.options;
		var $child = this.element.children(op.childClass);
		var $otherChild = op.otherChildClass == null ? null : this.element.children(op.otherChildClass);

		fn = typeof fn == "undefined" ? function () { } : fn;

		// If can't fill window with dialog through CSS, do it manually.
		if ($child.css("position") != "absolute")
		{
			$child.css("minHeight", ($(window).height() - op.padding) + "px");
		}

		$child.fadeIn(op.fadeTime, function ()
		{
			if ($otherChild != null) $otherChild.fadeIn(op.fadeTime);
			fn();
		});

		op.visible = true;
	},

	slideOut: function ()
	{
		var _this = this;
		var op = this.options;

		if (op.visible)
		{
			if (op.slideVertically)
			{
				this.element
				.animate({ top: $(window).height() + "px" }, op.slideTime, function () { _this.element.hide(); })
				.children(op.childClass)
				.fadeOut(op.fadeTime)
				.siblings(op.otherChildClass)
				.fadeOut(op.fadeTime);
			}
			else
			{
				this.element
				.animate({ left: $(window).width() + "px" }, op.slideTime, function () { _this.element.hide(); })
				.children(op.childClass)
				.fadeOut(op.fadeTime)
				.siblings(op.otherChildClass)
				.fadeOut(op.fadeTime);
			}

			op.visible = false;
		}

		return this;
	},

	// Visible?
	// this = class
	visible: function (val)
	{
		var op = this.options;

		if (typeof (val) === "undefined")
		{
			return op.visible;
		}
		else
		{
			op.visible = val;
		}
	}
});