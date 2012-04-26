/**
* Show error and warning alerts (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.widget.subclass("ui.vgAlert",
{
	// Required: $results, $video
	options:
	{
		$results: null, 	// Results container
		$video: null, 	// Video container

		$notices: null,
		current: 0,
		error: false, 	// Put error alert text here
		warning: false, 	// Put warning alert text here
		visible: false,
		fadeTime: 500, 	// Fade between alerts time
		animateTime: 200, // Show / hide alert box time
		alertHeight: 30		// Height of alert box
	},

	_init: function ()
	{
		this.options.$notices = this.element.append("<div/><div/>").children();
	},

	// this = class
	error: function (error)
	{
		if (typeof (error) == "undefined")
		{
			return this.options.error;
		}
		else
		{
			this.options.error = error;
			return this;
		}
	},

	// this = class
	warning: function (warning)
	{
		if (typeof (warning) == "undefined")
		{
			return this.options.warning;
		}
		else
		{
			this.options.warning = warning;
			return this;
		}
	},

	// this = class
	show: function (showWarning)
	{
		var msg;
		var msgClass;
		var sameMsg = true;
		var noMsg = false;
		var op = this.options;
		var _this = this;

		// Check it's a new message.
		if (op.error)
		{
			// Browser may render HTML differently from that supplied, so push through browser
			sameMsg = op.$notices.eq(op.current).html() == $("<div/>").html(op.error).html();
		}
		else if (showWarning && op.warning)
		{
			sameMsg = op.$notices.eq(op.current).html() == $("<div/>").html(op.warning).html();
		}
		else
		{
			noMsg = true;
		}

		if ((op.error || showWarning && op.warning) && !(sameMsg && op.visible))
		{
			if (op.error)
			{
				msg = op.error;
				msgClass = "Error";
			}
			else if (op.warning)
			{
				msg = op.warning;
				msgClass = "Warning";
			}

			// If no alert is visible make space, else 'cross'fade. 
			if (!op.visible)
			{
				op.$results.animate({ marginTop: "+=" + op.alertHeight + "px" }, op.animateTime);
				op.$video.animate({ marginTop: "+=" + op.alertHeight + "px" }, op.animateTime);
				this.element.animate({ height: op.alertHeight + "px" }, op.animateTime);
			}
			op.$notices.eq(op.current).fadeOut(op.fadeTime, function ()
			{
				op.$notices.eq(op.current = (op.current + 1) % 2).html(msg).removeClass().addClass(msgClass).fadeIn(op.fadeTime);
			});

			op.error = op.warning = false;
			op.visible = true;
		}
		else if (noMsg && op.visible)
		{
			// this = el
			op.$notices.eq(op.current).fadeOut(op.fadeTime, function ()
			{
				op.$results.animate({ marginTop: "-=" + op.alertHeight + "px" }, op.animateTime);
				op.$video.animate({ marginTop: "-=" + op.alertHeight + "px" }, op.animateTime);
				_this.element.animate({ height: "0" }, op.animateTime);
			});

			op.visible = false;
		}
		else if (sameMsg && op.visible)
		{
			op.error = op.warning = false;
		}
	}
});