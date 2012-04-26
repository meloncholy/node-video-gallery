/*!
* Video Gallery
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence 
* Includes some code written by others; see dev source for details. 
* Version 0.1
*/

$.ui.widget.subclass("ui.vgStart",
{
	options:
	{
		title: "Video Gallery", 		// Window title
		titlePost: " | Video Gallery", // Window title appended to search, videos, etc. 
		prettyLink: "video/", 		// Hash fragment to prepend to all videos for SEO
		searchTracker: false,
		searchDelay: 250,
		resizeTracker: false,
		resizeDelay: 250,
		suggestTracker: false,
		suggestDelay: 50,
		suggestAjax: null,
		hashTracker: false,
		hashDelay: 1000, 				// When searching, wait this long before updating the hash
		autosuggestUrl: "search/autosuggest/",
		filterHeight: 123, 				// Height of the filters div
		searchTxt: "", 					// Current search string (for seeing if it's changed)
		prevSearchTxt: "", 				// Previous search string (for seeing if we're continuing with the same search)
		prevHash: null, 				// Previous hash (restored after closing a video or dialog)
		activeFilters: false, 			// Are the filters in use?
		hiddenFilters: false, 			// Are the filters active but hidden (because showing a video)?
		filterChange: false, 			// Make sure don't close the filters panel if user turns them all off, but do close when navigating through history.
		slideInTime: 200,
		slideOutTime: 100,
		slideOutDelay: 100,
		logoUrl: "images/theme/logo-big.png",
		bgUrl: "images/theme/bg.jpg",

		$crumbs: null,
		$results: null,
		$video: null,
		$contact: null,
		$suggest: null,
		$filters: null,
		$searchBox: null,
		$searchInput: null,
		$autosuggest: null,
		$filters: null,
		$alert: null,

		alertClass: ".Alert",
		resultsClass: ".Results",
		videoClass: ".Video",
		relatedVideosClass: ".RelatedVideos",
		feedbackClass: ".Feedback",
		searchBoxClass: ".Search",
		searchInputClass: ".SearchInput",
		autosuggestClass: ".Autosuggest",
		filtersClass: ".Filters",
		contentClass: ".Content"
	},

	_create: function ()
	{
		var footerHeight;
		var op = this.options;
		var _this = this;
		var img;

		op.$crumbs = $(document).vgCrumbs();
		op.$alert = $(op.alertClass).vgAlert({ $results: $(op.resultsClass), $video: $(op.videoClass) });
		op.$results = $(op.resultsClass).vgResults({ $alert: op.$alert });
		op.$video = $(op.videoClass).vgVideo({ $crumbs: op.$crumbs, showResults: function () { _this._showResults(); return this; }, relatedVideosClass: op.relatedVideosClass, prettyLink: op.prettyLink });
		op.$crumbs.vgCrumbs("setVideo", op.$video);
		footerHeight = parseInt(op.$results.css("marginBottom"));
		op.$contact = $(op.feedbackClass).vgContact({ footerHeight: footerHeight, prettyLink: op.prettyLink });
		op.$suggest = $(op.feedbackClass).vgSuggest({ footerHeight: footerHeight, prettyLink: op.prettyLink });
		op.$searchBox = $(op.searchBoxClass);
		op.$searchInput = $(op.searchInputClass);
		op.$autosuggest = $(op.autosuggestClass);
		op.$filters = $(op.filtersClass);
		op.$crumbs.vgCrumbs("clearVideos");
		$(window).resize(function () { _this.resizeDelay(); });
		op.$results.scroll(this.scrollDelay).scroll();
		op.$searchInput.keydown(function (e) { _this._tabCapture(e); }).keyup(function (e) { _this.searchDelay(e); }).val("");
		$(window).hashchange(function () { _this._hashChange(); }).hashchange();
		$(".ToggleFilters, #filtersLink").click(function () { if (op.activeFilters) _this._hideFilters(); else _this._showFilters(); return false; });

		$(document).keydown(function (e)
		{
			var url = location.href.split("#!")[1] || location.href.split("#%21")[1];

			// Esc
			if (e.which == 27)
			{
				// Contact dialog
				if (url.substring(0, 8) == "contact/")
				{
					location.hash = "#!";
				}
				// Video dialog
				else if (url.substring(0, op.prettyLink.length) == op.prettyLink)
				{
					// Suggest name dialog over video dialog
					if (op.$suggest.vgSuggest("visible"))
					{
						op.$suggest.vgSuggest("hide");
					}
					else
					{
						location.hash = "#!";
					}
				}
			}
		});

		$("#searchButton").click(function ()
		{
			if (op.$searchInput.val() != "" && !op.activeFilters)
			{
				op.searchTxt = op.$searchInput.val();
				_this.searchDelay();
			}
		});

		$("#browseButton").click(function ()
		{
			if (!$(this).hasClass("Disabled"))
			{
				op.$searchInput.val("");
				op.$autosuggest.text("");
				op.searchTxt = "";
				if (op.hashTracker) clearTimeout(op.hashTracker);
				_this.search(true);
			}
		});

		this.element.bind("slide", function (e) { op.filterChange = true; _this.search(true); });

		// Small delay to get round button down coming after focus fires
		$("input[type=text], textarea").live("focus", function () { var $this = this; setTimeout(function () { $this.select(); }, 50); });
		$("input[type=text].ReadOnly").live("keypress", function () { return false; });
		$(".SearchLink").live("click", function (e) { _this._searchSpellcheck(e); return false; });
		$(".FiltersLink").live("click", function () { _this._hideFilters(); return false; });

		$(".Results .Box, .Video .SimilarVideos li").live("hover", function (e)
		{
			var $this = $(this);

			// Hover mapped to mouseenter, mouseleave
			if (e.type == "mouseenter")
			{
				if ($this.find(".SlideBackground").length == 0) $this.find("span").append("<span />").children().addClass("SlideBackground");
				$this.find(".SlideBackground").clearQueue().animate({ top: "0" }, op.slideInTime);
			}
			else
			{
				$this.find(".SlideBackground").clearQueue().delay(op.slideOutDelay).animate({ top: "100%" }, op.slideOutTime);
			}
		});

		img = new Image();
		img.src = op.logoUrl;

		$(img).load(function ()
		{
			$(img).unbind("load").load(function () { $(".Background").css("backgroundImage", "url(\"" + op.bgUrl + "\")").fadeIn(500); delete img; });
			img.src = op.bgUrl;
		});
	},

	// Setup window to show results on search.
	// this = class
	_showResults: function (animate)
	{
		var op = this.options;

		if (typeof (animate) === "undefined") animate = false;

		if (op.$searchBox.hasClass("Home"))
		{
			if (animate)
			{
				$(".Logo").fadeOut(50).addClass("Small").fadeIn(50);
				op.$searchBox.animate({ marginTop: "-=100" }, 100, function () { var $this = $(this); $this.css("marginTop", ""); setTimeout(function () { $this.addClass("Top"); }, 500); }).removeClass("Home").find("#contact").fadeIn(300);
				op.$results.fadeIn(300);
			}
			else
			{
				op.$searchBox.removeClass("Home").addClass("Top").find("#contact").show();
				$(".Logo").addClass("Small");
				op.$results.show();
			}
		}

		return this;
	},

	// Search: sort out the hash and pass the search parameters on to $results
	// this = class
	search: function (animate)
	{
		var op = this.options;
		var filters;
		var search;

		this._showResults(animate);
		op.$crumbs.vgCrumbs("clearVideos");
		filters = this._buildFilters();
		this._searchHash();

		search = op.$searchInput.val();
		document.title = (search == "" ? (op.activeFilters ? "Search" : "Browse") : search + " - Search") + op.titlePost;
		//op.prevTitle = document.title;
		op.$results.vgResults("search", search, filters);
	},

	// Change the hash to reflect the new search
	// this = class
	_searchHash: function ()
	{
		var searchHash;
		var op = this.options;

		searchHash = "#!search/" + encodeURIComponent(op.searchTxt);

		if (op.activeFilters)
		{
			$(".Slider").each(function ()
			{
				var id = $(this).attr("id");
				var val = this.value();

				if (val !== null) searchHash += "+" + id + "=" + val;
			});
		}

		if (searchHash == "#!search/") searchHash = "#!browse/";

		// Stop triggering hashchange if no change
		if (searchHash == "#!" + location.href.split("#!")[1])
		{
			if (op.hashTracker) clearTimeout(op.hashTracker);
			return;
		}

		// Continuing previous search?
		if (op.prevSearchTxt != "" && op.searchTxt.substring(0, op.prevSearchTxt.length) == op.prevSearchTxt)
		{
			// Bug: (usually) stores first hash in history, not replacement. 
			// http://code.google.com/p/chromium/issues/detail?id=82261
			// Bug: If using history.back(1) (and location.hash) instead, Chrome autosuggests URLs.
			// http://stackoverflow.com/questions/5991653/stop-chrome-autocompleting-url-hashes
			if ($.browser.webkit)
			{
				if (op.hashTracker) { clearTimeout(op.hashTracker); }
				op.hashTracker = setTimeout(function () { location.hash = searchHash; }, op.hashDelay);

				/*setTimeout(function ()
				{
				//history.back(1);
				//setTimeout(function () { location.hash = searchHash; }, 200);
				}, 200);*/
			}
			else
			{
				// Firefox automatically decodes parameter if use location.hash, and '%20' is longer than ' '
				location.replace(location.href.slice(0, -location.href.split("#!")[1].length - 2) + searchHash);
			}
		}
		else
		{
			location.hash = searchHash;
		}

		op.prevSearchTxt = op.searchTxt;
	},

	// Build an object with the filters' states to pass via JSON.
	_buildFilters: function ()
	{
		var filters = new Object();
		var op = this.options;

		if (op.activeFilters)
		{
			$(".Slider").each(function () { filters[$(this).attr("id")] = this.value(); });
			return filters;
		}

		return null;
	},

	// See if need to load more search results after resizing the window. Delay so don't call repeatedly if resizing window with mouse.
	// this = class
	resizeDelay: function ()
	{
		var op = this.options;

		if (op.resizeTracker) clearTimeout(op.resizeTracker);
		op.resizeTracker = setTimeout(function ()
		{
			if (op.visible)
			{
				op.$video.css("left", $(window).width() + "px");
			}
			else
			{
				op.$video.find(op.contentClass).css("minHeight", ($(window).height() - op.padding) + "px");
			}

			op.$results.vgResults("loadBatch", true);
		}
		, op.resizeDelay);
	},

	// Accept spelling correction.
	// this = class
	_searchSpellcheck: function (e)
	{
		this.options.$searchInput.val($(e.currentTarget).text());
		this.searchDelay();
	},

	// Show the filters div
	// this = class
	_showFilters: function ()
	{
		var op = this.options;
		var _this = this;

		op.activeFilters = true;
		op.$filters.animate({ height: "+=" + op.filterHeight + "px" }, 200);
		op.$results.animate({ top: "+=" + op.filterHeight + "px" }, 200);
		$("#browseButton").addClass("Disabled");

		// Always hide video if showing filters.
		if (op.$video.vgVideo("visible"))
		{
			op.$video.vgVideo("hide");
			this.search();
		}

		$(".Slider").each(function ()
		{
			if (this.value() != null)
			{
				_this.search();
				return false;
			}
		});
	},

	// Hide the filters div
	// this = class
	_hideFilters: function ()
	{
		var op = this.options;
		var _this = this;

		if (!op.hiddenFilters) op.$filters.animate({ height: "-=" + op.filterHeight + "px" }, 200);
		op.$results.animate({ top: "-=" + op.filterHeight + "px" }, 200);
		$("#browseButton").removeClass("Disabled");

		op.activeFilters = false;
		op.hiddenFilters = false;

		$(".Slider").each(function ()
		{
			if (this.value() != null)
			{
				_this.search();
				return false;
			}
		});
	},

	// Set autosuggest text
	// this = class
	suggestVideo: function ()
	{
		var op = this.options;
		var filters;

		if (op.suggestAjax != null) op.suggestAjax.abort();
		filters = this._buildFilters();

		op.suggestAjax = $.post(op.autosuggestUrl, { search: op.$searchInput.val(), filters: filters }, function (data)
		{
			op.suggestAjax = null;
			// In case input deleted during AJAX.
			if (op.$searchInput.val() == "") return;
			data = typeof data == "object" ? data : $.parseJSON(data);
			op.$autosuggest.html(data.autosuggest);
		});
	},

	// Insert autosuggest text on tab
	// this = class
	_tabCapture: function (e)
	{
		var op = this.options;

		if (e.keyCode == 9 && op.$searchInput.val() != op.$autosuggest.text() && op.$autosuggest.text() != "")
		{
			op.$searchInput.val(op.$autosuggest.text());
			e.preventDefault();
		}
	},

	// Timeout (usually) before searching. Also cope with enter & esc in input box, call autosuggeset. 
	// this = class
	searchDelay: function (e)
	{
		var op = this.options;
		var _this = this;

		// Clear autosuggest if no longer matches.
		if (op.$searchInput.val() == "" || e !== undefined && (e.keyCode == 13 || e.keyCode == 27))
		{
			op.$autosuggest.text("");
			if (e !== undefined && e.keyCode == 13) op.$alert.vgAlert("show", true);
		}

		// Ignore arrows, etc.
		if (op.searchTxt == op.$searchInput.val()) return;

		if (op.$autosuggest.text().substring(0, op.$searchInput.val().length) != op.$searchInput.val())
		{
			op.$autosuggest.text("");
			if (op.suggestTracker) clearTimeout(op.suggestTracker);
			op.suggestTracker = setTimeout(function () { _this.suggestVideo(); }, op.suggestDelay);
		}

		// e === undefined when called directly (not via keyup event)
		if (e === undefined || (op.$searchInput.val() != op.searchTxt && op.$searchInput.val() != ""))
		{
			op.searchTxt = op.$searchInput.val();
			if (op.hashTracker) clearTimeout(op.hashTracker);
			if (op.searchTracker) clearTimeout(op.searchTracker);

			if (e === undefined)
			{
				this.search(true);
			}
			else
			{
				op.searchTracker = setTimeout(function () { _this.search(true); }, op.searchDelay);
			}
		}

		// Stop going to browse if searchDelay runs with single letter input and letter deleted before search runs.
		if (op.$searchInput.val() == "")
		{
			if (op.searchTracker) clearTimeout(op.searchTracker);
			if (op.suggestTracker) clearTimeout(op.suggestTracker);
		}
	},

	// Do things when the hash changes as a result of a link, history or linking on that hash. 
	// this = class
	_hashChange: function ()
	{
		// Firefox automatically decodes parameter if use location.hash
		// http://stackoverflow.com/questions/4835784/firefox-automatically-decoding-encoded-parameter-in-url-does-not-happen-in-ie
		//var url = location.hash.substring(2);
		// Firefox (6?) will sometimes encode the ! as %21. Because it can, presumably. 
		var url = location.href.split("#!")[1] || location.href.split("#%21")[1];
		var hash = location.hash;
		var searchHash;
		var filter;
		var op = this.options;
		var searchTxt;

		if (op.hiddenFilters)
		{
			op.hiddenFilters = false;
			op.$filters.css({ height: "+=" + op.filterHeight + "px", marginBottom: 0 + "px" });
		}

		// Distinguish http://example.com#! (e.g. closing video window, url == "") and http://example.com (site home, url == undefined)
		//if (url === "")
		if (hash == "#!")
		{
			document.title = op.title;
			op.$video.vgVideo("hide");
			op.$contact.vgContact("hide");

			if (op.prevHash != null)
			{
				// Restore previous search / browse
				location.hash = op.prevHash;
			}
			else
			{
				// Go home
				//url = undefined;
				location.hash = "";
			}
		}

		//if (url === undefined)
		if (hash == "")
		{
			document.title = op.title;
			op.$video.vgVideo("hide");
			op.$contact.vgContact("hide");

			if (!op.$searchBox.hasClass("Home"))
			{
				op.$searchBox.removeClass("Top").addClass("Home").find("#contact").hide();
				$(".Logo").removeClass("Small");
				op.$results.hide();
			}
		}
		else
		{
			// Hide the home screen
			if (op.$searchBox.hasClass("Home"))
			{
				op.$searchBox.removeClass("Home").addClass("Top").find("#contact").show();
				$(".Logo").addClass("Small");
				op.$results.show();
			}

			if (url !== undefined)
			{
				// Show a video
				if (url.substring(0, op.prettyLink.length) == op.prettyLink)
				{
					op.$contact.vgContact("hide");

					if (op.activeFilters)
					{
						op.hiddenFilters = true;
						op.$filters.css({ height: "-=" + op.filterHeight + "px" });
					}

					op.$video.vgVideo("show", url);
				}
				else if (url.substring(0, 8) == "contact/")
				{
					op.$video.vgVideo("hide");
					op.$contact.vgContact("show");
				}
				else if (url.substring(0, 7) == "search/")
				{
					op.$video.vgVideo("hide");
					op.$contact.vgContact("hide");
					op.prevHash = location.hash;
					searchHash = url.substring(7).split("+");

					//if (searchHash[0].length != 0 && op.searchTxt == "")
					searchTxt = decodeURIComponent(searchHash[0]);

					if (searchTxt != op.searchTxt)
					{
						//searchTxt = decodeURIComponent(searchHash[0]);
						op.$searchInput.val(searchTxt);

						// _hashChange (via _showFilters) needs op.searchTxt to match hash so don't trigger browser URL change. _showFilters also runs search.
						// searchDelay won't call search if it does match, so make sure search runs via _showFilters if have filters and via searchDelay if don't.
						// If filters in hash && op.activeFilters == true && hash is changed manually (or via history), will not update. **BUG**
						//if (searchHash.length > 1) op.searchTxt = searchTxt;
					}

					// Get filters from hash
					for (var i = 1; i < searchHash.length; i++)
					{
						filter = searchHash[i].split("=");
						$("#" + filter[0])[0].value(filter[1]);
					}

					if (searchHash.length > 1 && !op.activeFilters)
					{
						this._showFilters();
					}
					else if (searchHash.length == 1 && op.activeFilters && !op.filterChange)
					{
						this._hideFilters();
					}

					// Only calls search if no filters (see above). Always updates autosuggest. 
					this.searchDelay();
				}
				else if (url.substring(0, 7) == "browse/")
				{
					op.$video.vgVideo("hide");
					op.$contact.vgContact("hide");
					if (op.activeFilters && !op.filterChange) this._hideFilters();
					op.$searchInput.val("");
					op.$autosuggest.text("");
					op.searchTxt = "";
					if (op.prevHash != location.hash) this.search();
					op.prevHash = location.hash;
				}

				op.filterChange = false;
			}
		}

		// Analytics async tracking (remove #! so it shows up)
		if (_gaq !== undefined)
		{
			_gaq.push(['_link', location.href.replace(/#!/, "")]);
		}
	}
});

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

/**
* Search results (Video Gallery)
*
* Copyright (c) 2011 Andrew Weeks http://meloncholy.com
* Dual licensed under the MIT and GPLv2 licences. See http://meloncholy.com/licence
* Version 0.1
*
* Originally based on AjaxScroll v0.1 (jQuery Plugins). 
*
* @author Timmy Tin (ycTIN)
* @license GPL
* @version 0.1
* @copyright Timmy Tin (ycTIN)
* @website http://project.yctin.com/ajaxscroll
*
*/

$.ui.widget.subclass("ui.vgResults",
{
	// Required: $crumbs
	options:
	{
		$crumbs: null,

		searchUrl: "search/",
		batchUrl: "search/batch/",
		$alert: null, 					// Display errors and warnings here
		$scrollPane: null,
		scrollDelay: 250,
		loadDelay: 500,
		scrollTracker: false,
		scrollTime: 250,
		scrollVideoOffset: 2, 			// When scrolling to video, number of videos to show above selected video
		batchSize: 20, 					// Videos in batch
		batchGroup: 5, 					// Number of (empty) batches to add at once
		offset: 0, 						// Offset in search results (used for getting more batches in infinite scroll)
		curPos: -1, 					// Location in scroll pane (have we moved?)
		count: 0, 						// Total number of results
		batches: 0, 					// Total number of batches
		upperBound: 0, 					// If go above this point, need to load more results
		lowerBound: 0,
		extraBound: 0,
		scrollPaneClass: ".ScrollPane",
		batchClass: ".Batch",
		boxClass: ".Box",
		emptyClass: ".Empty",
		activeClass: ".Active",
		activeChild: null, 				// What should be active child if currently not loaded in list
		searchAjax: null
	},

	_create: function ()
	{
	},

	_init: function ()
	{
		var _this = this;
		var op = this.options;

		op.$scrollPane = $("<div/>").addClass(op.scrollPaneClass.substring(1));
		this.element.append(this.options.$scrollPane).scrollTop(0).scrollLeft(0);
		this.setBounds();
		$(window).resize(function () { _this.setBounds(); });
		this.element.scroll(function () { _this._scrollDelay(); }).scroll();
	},

	// this = class
	search: function (search, filters)
	{
		var _this = this;
		var op = this.options;

		// Prevent possible out of order responses
		if (op.searchAjax != null) op.searchAjax.abort();

		// this = jQuery JSON
		op.searchAjax = $.post(this.options.searchUrl, { search: search, filters: filters }, function (data)
		{
			op.searchAjax = null;
			// Why is $.post returning an object from Node?
			_this.results(typeof data == "object" ? data : $.parseJSON(data));
		});
	},

	// Load first batch of results
	// this = class
	results: function (data)
	{
		var op = this.options;
		var $alert = op.$alert;
		var _this = this;

		op.$scrollPane.empty();
		op.offset = 0;
		op.curPos = -1;
		op.count = data.count;
		op.batches = Math.ceil(op.count / op.batchSize);

		if ($alert !== null)
		{
			if (data.error) $alert.vgAlert("error", data.error);
			if (data.warning) $alert.vgAlert("warning", data.warning);
			// Doesn't show warnings if searching from hash. **BUG**
			$alert.vgAlert("show", false);
		}

		// Add batches until get to index of selected video (only for results list at side when showing video; for main results, just do this once)
		while (op.count > 0 && op.offset <= data.videoIdx) this._addBatch();
		// Load first batch and check if others visible.
		op.$scrollPane.children(op.batchClass + ":first").nextUntil(op.batchClass).remove().end().replaceWith(data.html);
		op.$scrollPane.children().slice(data.videoIdx, data.videoIdx + 1).addClass(op.activeClass.substring(1));
		this.loadBatch();
		// Let the browser catch up.
		setTimeout(function () { _this.active(data.videoIdx, false); }, op.scrollDelay);
	},

	// Set scroll positions for adding more batches
	// this = class
	setBounds: function ()
	{
		var op = this.options;
		var parent;
		var height;

		// If parent hidden, height will be 0.
		if (this.element.parent(":visible").length == 0)
		{
			parent = this.element.parent().css("visibility", "hidden").show();
			height = this.element.height();
			parent.hide().css("visibility", "visible");
		}
		else
		{
			height = this.element.height();
		}

		op.upperBound = height;
		op.lowerBound = -height;
		op.extraBound = 2 * height;
	},

	// Add new empty batches
	// this = class
	_addBatch: function ()
	{
		var op = this.options;
		var $batch;

		for (var g = 0; g < op.batchGroup && op.offset < op.count; g++)
		{
			$batch = $("<a/>").data("offset", op.offset++).addClass(op.boxClass.substring(1) + " " + op.batchClass.substring(1) + " " + op.emptyClass.substring(1));

			for (var b = 1; b < op.batchSize && op.offset++ < op.count; b++)
			{
				$batch = $batch.after("<a class=\"" + op.boxClass.substring(1) + "\"></a>");
			}

			op.$scrollPane.append($batch);
		}
	},

	// Wait for a bit in case scrolling furiously
	// Event: this = class
	_scrollDelay: function ()
	{
		var _this = this;
		var op = this.options;

		if (op.scrollTracker) clearTimeout(op.scrollTracker);
		op.scrollTracker = setTimeout(function () { _this.loadBatch(); }, op.scrollDelay);
	},

	// Load a new batch of results
	// this = class
	loadBatch: function (resize)
	{
		var op = this.options;
		var el = this.element[0];
		var newPos = this.element.scrollTop();
		resize = typeof (resize) == "undefined" ? false : resize;

		if (op.curPos != newPos || resize)
		{
			op.curPos = newPos;

			// Check each emtpy batch to see if it's (nearly) in the viewport and load stuff if it is
			op.$scrollPane.children(op.emptyClass).each(function (i, batch)
			{
				var $batch = $(batch);
				var pos = $batch.position().top;
				var $segment;
				var idx;

				if (op.lowerBound > pos || pos > op.upperBound) return;

				// this = jQuery JSON
				$.post(op.batchUrl, { offset: $batch.data("offset") }, function (data)
				{
					data = typeof data == "object" ? data : $.parseJSON(data);

					if (data.html !== undefined)
					{
						$segment = $batch.nextUntil(op.batchClass);
						idx = $segment.filter(op.activeClass).index();
						// remove(), replaceWith() as only want 1 copy of data.html
						$segment.remove().end().replaceWith(data.html);

						if (idx != -1)
						{
							op.$scrollPane.children().slice(idx, idx + 1).addClass(op.activeClass.substring(1));
						}
						else if (op.activeChild != null)
						{
							// If non-0 array
							op.$scrollPane.children(op.activeChild).addClass(op.activeClass.substring(1));
						}
					}
					//data.error = "This is a test error " + Math.random();

					if (op.$alert !== null)
					{
						if (data.error) op.$alert.vgAlert("error", data.error);
						if (data.warning) op.$alert.vgAlert("warning", data.warning);
						op.$alert.vgAlert("show", true);
					}
				});
			});

			// Add more empty batches if close enough to the bottom.
			if (op.offset < op.count && el.scrollTop > 0 && el.scrollHeight - el.scrollTop < op.extraBound)
			{
				this._addBatch();
			}
		}
	},

	active: function (video, swapClass)
	{
		var pos;
		var topPos;
		var op = this.options;
		var $scrollPane = op.$scrollPane;
		var el = this.element;
		var $child;
		var $topChild;
		var topVideo; 	// Scroll list to this position

		swapClass = swapClass === undefined ? true : swapClass;

		if (video === undefined)
		{
			return op.$scrollPane.children(op.activeClass);
		}
		else
		{
			if ($scrollPane.children().length == 0 || video == 0) return;

			op.activeChild = null;

			// Do this now so remove active if new not in list.
			if (swapClass) $scrollPane.children().removeClass(op.activeClass.substring(1));

			// Passed an id or index?
			if (this._isInt(video))
			{
				$child = $scrollPane.children().slice(video, video + 1);
				topVideo = Math.max(video - op.scrollVideoOffset, 0);
			}
			else
			{
				$child = $scrollPane.children(video);

				// Not in list (other similar video or in non-loaded part of list).
				if ($child.length == 0)
				{
					op.activeChild = video;
					return;
				}
				topVideo = Math.max($scrollPane.children(video).index() - op.scrollVideoOffset, 0);
			}

			$child.addClass(op.activeClass.substring(1));
			$topChild = $scrollPane.children().slice(topVideo, topVideo + 1);

			if (el.filter(":visible").length == 0)
			{
				el.css("visibility", "hidden").show();
				pos = $child.position().top;
				topPos = $topChild.position().top + el.scrollTop();
				el.hide().css("visibility", "visible");
			}
			else
			{
				pos = $child.position().top;
				topPos = $topChild.position().top + el.scrollTop();
			}

			// Chrome needs a little time to think if using video cache
			if (pos < 0 || pos > el.height()) setTimeout(function () { el.animate({ scrollTop: topPos }, op.scrollTime); }, op.loadDelay);
		}
	},

	// http://www.peterbe.com/plog/isint-function
	_isInt: function (x)
	{
		var y = parseInt(x);
		if (isNaN(y)) return false;
		return x == y && x.toString() == y.toString();
	}
});

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

