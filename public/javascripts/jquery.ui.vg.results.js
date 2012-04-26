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