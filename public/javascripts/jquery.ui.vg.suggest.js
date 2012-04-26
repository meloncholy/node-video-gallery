/**
* Suggest name dialog (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.vgFeedback.subclass("ui.vgSuggest",
{
	options:
	{
		showUrl: "feedback/name/",
		submitUrl: "feedback/submit_name/"
	},

	_create: function ()
	{
		var _this = this;

		$(".SuggestName").live("click", function () { _this.show(); return false; });
	},

	// Event: this = class
	_submitDialog: function (e)
	{
		var _this = this;

		if (!e.currentTarget.checkForm()) return false;

		$.post(this.options.submitUrl,
		{
			url: $("#url").val(),
			name: $("#name").val(),
			suggestion: $("#suggestion").val(),
			comment: $("#comment").val(),
			author: $("#author").val(),
			email: $("#email").val()
		},
		function (data) { _this._showSubmitResults(data); });
		return false;
	},

	show: function ()
	{
		var _this = this;
		var op = this.options;

		// Omit #!pretty-link/
		$.post(op.showUrl, { url: location.hash.substring(op.prettyLink.length + 2), name: $(".VideoName").html() }, function (data) { _this._showAjax(data); });
		return false;
	}
});