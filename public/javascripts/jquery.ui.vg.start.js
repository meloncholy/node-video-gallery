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
			// This breaks Ghostery and doesn't seem to work anyway...
			//_gaq.push(['_link', location.href.replace(/#!/, "")]);
			_gaq.push(['_link', location.href]);
		}
	}
});