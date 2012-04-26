/**
* Effects (Video Gallery)
* 
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

(function ($)
{
	function sortArgs(duration, easing, callback)
	{
		var fn;

		// Who needs arguments?
		fn = $.isFunction(callback) ? callback : $.isFunction(easing) ? easing : $.isFunction(duration) ? duration : null;

		// If easing but no duration supplied, only cope with default 2. 
		if (typeof easing !== "string" && (duration === "swing" || duration === "linear"))
		{
			easing = duration;
		}

		// Named jQuery durations are 'slow'=600, 'fast'=200, other=400
		if (typeof duration !== "number")
		{
			if (duration == "slow")
			{
				duration = 600;
			}
			else if (duration == "fast")
			{
				duration = 200;
			}
			else
			{
				duration = 400;
			}
		}

		return { duration: duration, easing: easing, callback: fn };
	}

	// A prettier transition that slides down (from full width) then fades in. 
	$.fn.slideFadeIn = function (duration, easing, callback)
	{
		var $this = this;
		var args = sortArgs(duration, easing, callback);
		var endOpacity = Number(this.css("opacity")) || 1;

		duration = args.duration;
		easing = args.easing;
		callback = args.callback;

		this.css("opacity", 0).slideDown(duration, easing, function ()
		{
			$this.animate({ opacity: endOpacity }, duration, easing, function ()
			{
				if (typeof callback == "function") callback();
			});
		});

		return this;
	};

	// Slide up (full width) and fade out. 
	$.fn.slideFadeOut = function (duration, easing, callback)
	{
		var $this = this;
		var args = sortArgs(duration, easing, callback);
		var endOpacity;

		duration = args.duration;
		easing = args.easing;
		callback = args.callback;

		this.animate(duration, function ()
		{
			endOpacity = $this.css("opacity");

			$(this).animate({ opacity: 0, height: "hide" }, duration, function ()
			{
				$(this).css("opacity", endOpacity);
				if (typeof callback == "function") callback();
			});
		});

		return this;
	};

	$.fn.slideFadeToggle = function (duration, easing, callback)
	{
		this.filter(":visible").length ? this.slideFadeOut(duration, easing, callback) : this.slideFadeIn(duration, easing, callback);
	};

	// Fade in and move slightly to the left (&agrave; la Windows 8)
	$.fn.nudgeFadeIn = function (duration, easing, callback)
	{
		var args = sortArgs(duration, easing, callback);
		var endOpacity = Number(this.css("opacity")) || 1;
		var endMarginLeft = Number(this.css("marginLeft")) || 0;
		var endMarginRight = Number(this.css("marginRight")) || 0;
		var nudgeSize = 25;

		duration = args.duration;
		easing = args.easing;
		callback = args.callback;

		this
		.css({ opacity: 0, marginLeft: endMarginLeft + nudgeSize + "px", marginRight: endMarginRight - nudgeSize + "px" })
		.show()
		.animate({ opacity: endOpacity, marginLeft: endMarginLeft + "px", marginRight: endMarginRight + "px" }, duration, easing, function ()
		{
			if (typeof callback == "function") callback();
		});

		return this;
	};
})(jQuery);
