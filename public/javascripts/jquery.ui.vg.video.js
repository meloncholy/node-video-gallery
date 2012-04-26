/**
* Video display (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*/

$.ui.vgDialog.subclass("ui.vgVideo",
{
	// Required: $crumbs
	options:
	{
		$crumbs: null,

		contentClass: ".Content",
		relatedVideosClass: ".RelatedVideos",
		allVideoClasses: "Small Medium Large",
		videoSizes:
		{
			large: { width: 1280, height: 720, bitrate: 2048 },
			medium: { width: 854, height: 480, bitrate: 1024 },
			small: { width: 640, height: 360, bitrate: 768 },
			mobile: { width: 320, height: 180, bitrate: 384 }
		},
		slideTime: 250,
		embedSizeDelay: 1500,
		embedSizeFadeTime: 200,
		similarFadeTime: { fadeOut: 50, fadeIn: 500 },
		resizeTime: 300,
		videoChangeTime: 600,
		slideVertically: false,

		showResults: null,
		$content: null,
		videosCache: new Array(), 	// Cache videos seen this session to avoid repeating JSON. Indexed by URL
		relatedVideosCache: new Array(), // Cache of related videos for URL
		$relatedVideos: null, 		// vg.uiResults object
		showUrl: "video/load/",
		videoClass: null,
		visible: false,
		embedSizeTracker: false,
		otherChildClass: ".RelatedVideos",
		videoAjax: null
	},

	_create: function ()
	{
		var op = this.options;

		op.videoClass = op.$crumbs.vgCrumbs("getVideoClass");
		op.$relatedVideos = $(op.relatedVideosClass).vgResults({ $alert: null });
		op.$content = this.element.find(op.contentClass);
	},

	// Show video page content.
	// this = class
	_showAjax: function (url, data)
	{
		var op = this.options;
		var $relatedVideos = op.$relatedVideos;
		var pos;
		var relatedData = new Object();
		var visible = op.visible;

		data = typeof data == "object" ? data : $.parseJSON(data);
		document.title = data.title;
		op.videosCache[url] = { html: data.html, title: data.title, image: data.image, url: data.url, video: data.video };

		op.$content.html(data.html);
		this._setupVideo(data.image, data.url, data.video);
		pos = { left: $relatedVideos.position().left, right: parseInt($relatedVideos.css("right")) };

		this.fadeIn(function ()
		{
			$relatedVideos
			.show()
			.animate({ left: pos.left + "px", right: pos.right + "px" }, op.slideTime);
		});

		if (visible) op.$content.nudgeFadeIn(op.videoChangeTime);

		relatedData.count = data.count;
		relatedData.html = data.relatedHtml;
		relatedData.videoIdx = data.videoIdx;

		if (!visible)
		{
			op.relatedVideosCache[url] = relatedData;
			$relatedVideos.vgResults("results", relatedData, null);
		}

		return this;
	},

	// Setup events. These should really be lives. 
	// this = class
	_setupVideo: function (image, url, video)
	{
		var _this = this;
		var el = this.element;
		var op = this.options;

		if (!el.hasClass(op.videoClass)) el.removeClass(op.allVideoClasses).addClass(op.videoClass);
		el.find("#shareToggleLink").click(function (e) { _this._sectionToggle(".ShareToggle", "#shareToggleLink .Button"); });
		el.find("#embedToggleLink").click(function (e) { _this._sectionToggle(".EmbedToggle", "#embedToggleLink"); });
		el.find(".EmbedSize li").hover(function (e) { _this._showEmbedSize(e); }, function (e) { _this._hideEmbedSize(e); }).click(function (e) { _this._changeEmbedSize(e); });
		// Just in case the hover fails
		el.find("#vidEmbedSize").click(function (e) { _this._hideEmbedSize(e); });
		el.find(".ShareToggle, .EmbedToggle").data("visible", false);
		el.find("input[type=text], textarea").focus(function () { var $this = this; setTimeout(function () { $this.select(); }, 50); });
		el.find(".VideoActions li:not(#shareToggleLink)").click(function (e) { _this._resizeVideo(e); });
		el.find("#shortLink").click(function (e) { _this._shareLinkToggle(e); });
		this._setupVideoPlayer(image, url, video);

		return this;
	},

	// Toggle between short (bit.ly) and long links to video
	// Event: this = class
	_shareLinkToggle: function (e)
	{
		var $shareLink = this.element.find("#shareLink");

		if (e.currentTarget.checked)
		{
			// Fuck yeah...
			// http://ejohn.org/blog/html-5-data-attributes/
			$shareLink.val($shareLink.data("shortLink"));
		}
		else
		{
			$shareLink.val($shareLink.data("longLink"));
		}
	},

	// Setup JW Player. Uses HTTP pseudostreaming. 
	// this = class
	_setupVideoPlayer: function (image, url, video)
	{
		var videoSizes = this.options.videoSizes;

		jwplayer("videoPlayer").setup(
		{
			flashplayer: "player.swf",
			image: image,
			allowfullscreen: true,
			provider: "http",
			levels:
			[
				{ bitrate: videoSizes.large.bitrate, file: url + "/l-" + video, width: videoSizes.large.width },
				{ bitrate: videoSizes.medium.bitrate, file: url + "/m-" + video, width: videoSizes.medium.width },
				{ bitrate: videoSizes.small.bitrate, file: url + "/s-" + video, width: videoSizes.small.width },
				{ bitrate: videoSizes.mobile.bitrate, file: url + "/i-" + video, width: videoSizes.mobile.width }
			]
		});
	},

	// Show a video. 
	// this = class
	show: function (url)
	{
		var op = this.options;
		var videosCache = op.videosCache;
		var _this = this;

		op.showResults();

		// Another video currently visible?
		if (op.visible)
		{
			op.$content.css("opacity", 0);
			op.$content.parent().scrollTop(0);
			// If changing video using a similar video link
			op.$relatedVideos.vgResults("active", "#video-" + url.substring(op.prettyLink.length).replace("/", "-"));
		}
		else
		{
			op.oldTitle = document.title;
		}

		// Seen this video before?
		if (videosCache[url])
		{
			document.title = videosCache[url].title;
			op.$content.html(videosCache[url].html);
			if (op.visible) op.$content.nudgeFadeIn(op.videoChangeTime);
			this._setupVideo(videosCache[url].image, videosCache[url].url, videosCache[url].video);
			// Should always be in cache.
			if (op.relatedVideosCache[url] && !op.visible) op.$relatedVideos.vgResults("results", op.relatedVideosCache[url], null);
			this.slideFadeIn();

			if (op.videoAjax != null)
			{
				op.videoAjax.abort();
				op.videoAjax = null;
			}
		}
		else
		{
			this.slideIn();

			if (op.videoAjax != null) op.videoAjax.abort();

			// Remove pretty-link/ from hash
			op.videoAjax = $.post(op.showUrl + url.substring(op.prettyLink.length), function (data) { op.videoAjax = null; _this._showAjax(url, data); });
		}
	},

	// Show popup of how big the embedded video will be
	// Event: this = class
	_showEmbedSize: function (e)
	{
		var $el = $(e.currentTarget);
		var _this = this;
		var op = this.options;

		if (!op.embedSizeTracker)
		{
			op.embedSizeTracker = setTimeout(function ()
			{
				var width = $el.data("width");
				var height = $el.data("height");

				$("#vidEmbedSize").css(
				{
					width: width + "px",
					height: height + "px",
					left: (_this.element.width() - width) / 2 + "px",
					fontSize: Math.round(width / 6) + "px",
					paddingTop: Math.round(height / 2.3) + "px",
					top: Math.max($el.position().top - height, 10) + "px"
				}).fadeIn(op.embedSizeFadeTime);

				clearTimeout(op.embedSizeTracker);
				op.embedSizeTracker = false;
			}, op.embedSizeDelay);
		}
	},

	// Hide the video embed size popup
	// Event: this = class
	_hideEmbedSize: function ()
	{
		var op = this.options;

		clearTimeout(op.embedSizeTracker);
		op.embedSizeTracker = false;
		$("#vidEmbedSize").fadeOut(op.embedSizeFadeTime);
	},

	// Change size of vid in embed iframe code
	// Event: this = class
	_changeEmbedSize: function (e)
	{
		var op = this.options;
		var $el = $(e.currentTarget);
		var $shareEmbed = $("#shareEmbed");

		$(".EmbedSize li").removeClass("Active");
		$el.addClass("Active");
		$shareEmbed.val(
			$shareEmbed.val()
			.replace(/width="[0-9]+"/, "width=\"" + $el.data("width") + "\"")
			.replace(/height="[0-9]+"/, "height=\"" + $el.data("height") + "\"")
		);

		clearTimeout(op.embedSizeTracker);
		op.embedSizeTracker = false;
	},

	// Show / hide the link / embed bits
	// Event: this = class
	_sectionToggle: function (sectionClass, linkClass)
	{
		$(linkClass).toggleClass("Selected");
		$(sectionClass).slideFadeToggle(500);
	},

	// Change the size of the video
	// Event: this = class
	_resizeVideo: function (e)
	{
		var op = this.options;
		var _this = this;
		var endSize = $(e.currentTarget).data("videoSize");
		var $content = op.$content;
		var $videoPlayer = $content.find("#videoPlayer");
		var $similarVideos = $content.find(".SimilarVideos ul");
		var videoClass;
		var growing;

		videoClass = op.videoClass = endSize.charAt(0).toUpperCase() + endSize.slice(1);
		op.$crumbs.vgCrumbs("setVideoSize");

		// jQuery blocks expando properties on objects (used in animation). Override temporarily.
		// http://stackoverflow.com/questions/2949478/jquery-script-that-used-to-work-is-not-working-with-jquery-1-4-2
		// Actually Chrome will only do the animation 1ce, so hide video instead. 
		// var noDataBak = $.noData;
		// jQuery.noData = {};

		if (this.element.hasClass(videoClass)) return;

		// Must change class first if shrinking, last if growing.
		growing = videoClass == "Large" || (videoClass == "Medium" && this.element.hasClass("Small"));

		$videoPlayer.css("visibility", "hidden");

		$similarVideos.fadeOut(op.similarFadeTime.fadeOut, function ()
		{
			if (!growing)
			{
				_this.element.removeClass("Small Medium Large").addClass(videoClass);
				$similarVideos.fadeIn(op.similarFadeTime.fadeIn);
			}
		});

		$content
		.animate({ width: op.videoSizes[endSize].width + "px" }, op.resizeTime)
		.find(".VideoContainer img")
		.animate({ width: op.videoSizes[endSize].width + "px", height: op.videoSizes[endSize].height + "px" }, op.resizeTime, function ()
		{
			//$videoPlayer.css({ width: op.videoSizes[endSize].width + "px", height: op.videoSizes[endSize].height + "px", display: "block" });
			$videoPlayer.resize(op.videoSizes[endSize].width, op.videoSizes[endSize].height).css("visibility", "visible");

			if (growing)
			{
				_this.element.removeClass("Small Medium Large").addClass(videoClass);
				$similarVideos.fadeIn(op.similarFadeTime.fadeIn);
			}
		});

		op.$relatedVideos.animate({ right: op.videoSizes[endSize].width + $content.position().left * 2 + "px" }, op.resizeTime);
	},

	// Get / set size of video. Should probably call _resizeVideo if setting...
	// this = class
	videoClass: function (newClass)
	{
		var op = this.options;

		if (typeof (newClass) === "undefined")
		{
			return op.videoClass;
		}
		else
		{
			op.videoClass = newClass;
		}
	}
});