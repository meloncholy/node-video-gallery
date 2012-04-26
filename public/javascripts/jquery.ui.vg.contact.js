/**
* Contact form (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.vgFeedback.subclass("ui.vgContact",
{
	options:
	{
		showUrl: "feedback/contact/",
		submitUrl: "feedback/submit_contact/",
		clearUrl: true
	},

	// Event: this = class
	_submitDialog: function (e)
	{
		var _this = this;

		if (!e.currentTarget.checkForm()) return false;

		$.post(this.options.submitUrl,
		{
			comment: $("#comment").val(),
			author: $("#author").val(),
			email: $("#email").val()
		},
		function (data) { _this._showSubmitResults(data); });

		return false;
	}
});