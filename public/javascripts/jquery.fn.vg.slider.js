/**
* Slider Control (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
* 
* Options
* 
* min: min slider value
* max: max slider value
* step: step size in slider values
* vertical: make a vertical slider through op.vertical or data-style="vertical"
* invert: low values at bottom / on right of slider = inverted
* minNull: return null as minimum slider value?
* $target: slide event target $(element)
* clickSliderSpeed: time taken to move slider control on click
* dragSliderSpeed: time taken to move slider control on drag
* 
* Example: $(".Slider.Vertical").slider({ max: 3, minNull: true, invert: true, vertical: true, $target: $(".Results") });
*
* Very loosely based on jqDnR - Minimalistic Drag'n'Resize for jQuery.
*
* Copyright (c) 2007 Brice Burgess <bhb@iceburg.net>, http://www.iceburg.net
* Licensed under the MIT License:
* http://www.opensource.org/licenses/mit-license.php
* 
* $Version: 2007.08.19 +r2
*/

(function ($)
{
	$.fn.slider = function (ops)
	{
		return this.each(function ()
		{
			var $controlEl = $(this);
			var $sliderEl = $controlEl.append("<div />").children().last();
			var minPos = 0;
			var maxPos;
			var stepPos;
			var controlOffset;
			var sliderPosLeft;
			var sliderPosTop;
			var sliderHalfSize;

			var op = $.extend(
			{
				min: 0,
				max: 1,
				step: 1,
				padding: parseInt($controlEl.css("paddingTop")) + parseInt($sliderEl.css("marginTop")),
				vertical: typeof $controlEl.data("style") != "undefined" && $controlEl.data("style").toLowerCase() == "vertical",
				invert: false,
				minNull: false,
				$target: null,
				clickSliderSpeed: 75,
				dragSliderSpeed: 50
			}, ops);

			// Add another value to the slider
			if (op.minNull) op.min--;

			var val = op.invert ? op.max : op.min;
			var oldVal = op.invert ? op.max : op.min;

			if (op.vertical)
			{
				maxPos = $controlEl.outerHeight() - $sliderEl.outerHeight() - parseInt($sliderEl.css("marginBottom"));
				if (op.invert) $sliderEl.css("top", maxPos + "px");
				sliderPosLeft = $sliderEl.position().left;
				sliderHalfSize = Math.round($sliderEl.outerHeight() / 2);
			}
			else
			{
				maxPos = $controlEl.outerWidth() - $sliderEl.outerWidth() - parseInt($sliderEl.css("marginRight"));
				if (op.invert) $sliderEl.css("left", maxPos + "px");
				sliderPosTop = $sliderEl.position().top;
				sliderHalfSize = Math.round($sliderEl.outerWidth() / 2);
			}

			// Round later so don't accumulate errors.
			stepPos = (maxPos - minPos) / ((op.max - op.min) * op.step);

			this.value = function (newVal)
			{
				if (newVal === undefined)
				{
					if (op.invert)
					{
						if (op.minNull)
						{
							return val == op.max ? null : op.min + op.max - val;
						}
						else
						{
							return op.min + op.max - val;
						}
					}
					else
					{
						if (op.minNull)
						{
							return val == op.min ? null : val;
						}
						else
						{
							return val;
						}
					}
				}
				else
				{
					if (op.invert)
					{
						if (op.minNull)
						{
							val = newVal == null ? op.max : op.min + op.max - newVal;
						}
						else
						{
							val = op.min + op.max - newVal;
						}
					}
					else
					{
						if (op.minNull)
						{
							val = newVal == null ? op.min : newVal;
						}
						else
						{
							val = newVal;
						}
					}

					if (op.vertical)
					{
						sliderPosTop = Math.round((val - op.min) * stepPos);
					}
					else
					{
						sliderPosLeft = Math.round((val - op.min) * stepPos);
					}

					$sliderEl.css({ left: sliderPosLeft + "px", top: sliderPosTop + "px" });
				}
			};

			$sliderEl.mousedown(function (e)
			{
				setupVals();
				$(document).mousemove(drag).mouseup(stop);
				return false;
			});

			$controlEl.mousedown(function (e)
			{
				setupVals();
				moveSlider(e, true, op.clickSliderSpeed);
			}).mouseup(stop);

			function setupVals()
			{
				controlOffset = (op.vertical ? $controlEl.offset().top : $controlEl.offset().left) + op.padding;
			}

			function drag(e)
			{
				moveSlider(e, false, op.dragSliderSpeed);
			}

			function moveSlider(e, animate, speed)
			{
				// (Cursor position on page - control offset - half slider height / step size), then check is in slider range. 
				var newVal = Math.max(Math.min(Math.round(((op.vertical ? e.pageY : e.pageX) - controlOffset - sliderHalfSize) / stepPos) + op.min, op.max), op.min);

				if (op.vertical)
				{
					sliderPosTop = Math.round((newVal - op.min) * stepPos);
				}
				else
				{
					sliderPosLeft = Math.round((newVal - op.min) * stepPos);
				}

				if (newVal != val)
				{
					val = newVal;

					if (stepPos > 10 || animate)
					{
						$sliderEl.clearQueue().animate({ left: sliderPosLeft, top: sliderPosTop }, speed);
					}
					else
					{
						$sliderEl.offset({ left: sliderPosLeft, top: sliderPosTop });
					}
				}
				return false;
			}

			function stop()
			{
				if (oldVal != val)
				{
					if (op.$target != null) op.$target.trigger("slide");
					oldVal = val;
				}

				$(document).unbind("mousemove", drag).unbind("mouseup", stop);
			}
		});
	};
})(jQuery);
