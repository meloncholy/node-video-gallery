/**
* Form validator (Video Gallery)
*
* .Required: check not emtpy
* .Email: check it's an email (or empty; use .Required.Email for both)
* #submit: submit form element
* .ValidateAlert: alert messages container
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

(function ($)
{
	$.fn.validateForm = function ()
	{
		var $alert = $(".ValidateAlert");

		return this.each(function ()
		{
			$(this).find(".Email").each(validate);
			$(this).find(".Required").each(validate);

			$(this).find("#submit")[0].checkForm = function ()
			{
				var $form = $(this).parents("form");

				// Total error count for top alert
				$alert.errors = 0;

				$form.find(".Email").each(function ()
				{
					if ($.trim(this.value) != "" && !this.value.match(/^\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\s*$/i))
					{
						$(this).parent().addClass("Error");
						$alert.slideFadeIn();
						$alert.errors++;
					}
				});

				$form.find(".Required").each(function ()
				{
					if ($.trim(this.value) == "")
					{
						$(this).parent().addClass("Error");
						$alert.slideFadeIn();
						$alert.errors++;
					}
				});

				return $alert.errors == 0;
			};

			// this = el
			function validate()
			{
				var _this = this;
				var email = $(this).hasClass("Email");
				var required = $(this).hasClass("Required");
				var $parent = $(this).parent();
				// Track typing: only stick up an error if field is invalid and something has been entered (i.e. not just tabbing through).
				var typing = false;
				var oldValue = "";

				$(this).blur(function ()
				{
					validateField(typing);
					typing = false;
					oldValue = this.value;
				})
				.keyup(function ()
				{
					typing = typing || this.value != oldValue;
					// Remove error alert immediately if corrected.
					if ($(this).parent().hasClass("Error")) validateField(true);
				});

				function validateField(typing)
				{
					if (typing)
					{
						if ((email && (required || $.trim(_this.value) != "") && !_this.value.match(/^\s*[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\s*$/i)) || (required && $.trim(_this.value) == ""))
						{
							if (!$parent.hasClass("Error"))
							{
								$parent.addClass("Error");
								$alert.errors++;
							}
						}
						else if ($(_this).parent().hasClass("Error"))
						{
							$parent.removeClass("Error");

							if (--$alert.errors == 0)
							{
								$alert.slideFadeOut();
							}
						}
					}
				}
			}
		});
	};
})(jQuery);
