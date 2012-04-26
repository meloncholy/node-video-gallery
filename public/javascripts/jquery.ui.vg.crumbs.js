/**
* Cookie to track video size and search results validity (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.widget.subclass("ui.vgCrumbs",
{
	_thisCrumbs: null,

	options:
	{
		$video: null,
		activeVideoClass: ".ActiveVideo"
	},

	_create: function ()
	{
		_thisCrumbs = this;
	},

	// Crumbs refs Videos and Videos refs Crumbs...
	setVideo: function ($video)
	{
		_thisCrumbs.options.$video = $video;
		return this;
	},

	checkVideos: function ()
	{
		return $.cookie("vgcrumbs").split(";")[1] == "true";
	},

	getVideoClass: function ()
	{
		var cookie = $.cookie("vgcrumbs");

		if (cookie !== null) return cookie.split(";")[0];

		if ($(window).width() > 1500)
		{
			return "Large";
		}
		else if ($(window).width() > 1000)
		{
			return "Medium";
		}
		return "Small";
	},

	clearVideos: function ()
	{
		var $video = _thisCrumbs.options.$video;

		$.cookie("vgcrumbs", $video.vgVideo("videoClass") + ";false", { path: '/' });
	},

	setVideoSize: function ()
	{
		var $video = _thisCrumbs.options.$video;
		var valid = $.cookie("vgcrumbs").split(";")[1];
		$.cookie("vgcrumbs", $video.vgVideo("videoClass") + ";" + valid, { path: '/' });
	}

});