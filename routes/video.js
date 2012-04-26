/**
 * Show a video and load related videos.
 * 
 * @package    VideoGallery
 * @subpackage routes.video
 * @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
 * @license    MIT licence. See http://meloncholy.com/licence for details.
 * @version    0.1
 * 
 */

"use strict";

var sanitize = require("validator").sanitize;
var VideoItem = require(global.appPath + "/models/VideoItem");
var crumbs = require(global.appPath + "/models/crumbs");

function video(settings) {
	var exports = {};
	var db = settings.vgDatabase;
	var appSettings = settings.vgSettings.app;


	// Go away!

	exports.index = function (req, res) {
		res.render("noVideo", { settings: appSettings }, function (err, html) {
			var data = {};

			if (err) throw err;

			data.title = "Error" + appSettings.appTitlePost;
			data.html = html;
			res.json(data);
		});
	};

	
	// Show a video.

	exports.load = function (req, res) {
		getVideo(req, res, false);
	};


	// Show a video embedded on another site.

	exports.embed = function (req, res) {
		getVideo(req, res, true);
	};


	// Get info about a video from the database and build a list of similar and related videos.
	// Similar videos: those that seem to match the current video by name and filter.
	// Related videos: others from the current search (or, if no search, the similar videos).

	function getVideo(req, res, embed) {
		var url = sanitize(req.params.url).xss();
		var otherid = req.params.otherid ? sanitize(req.params.otherid).xss() : null;

		if (!url) {
			if (embed) {
				res.render("embedNoVideo", { settings: appSettings });
			} else {
				res.render("noVideo", { settings: appSettings }, function (error, html) {
					if (error) throw error;
					res.json({ html: html, title: "Error" + appSettings.siteTitlePost });
				});
			}
			return;
		}

		//**** ?? like? $url = $this->db->escape_str($url);
		var sql = "SELECT videos.name, videos.difficulty, videos.strength, videos.flexibility, videos.invert, videos.spin, videos.transition, videos.url, videos.image, videos.video, othernames.id AS otherid, othernames.name AS othername FROM videos LEFT JOIN othernames ON videos.id=othernames.videoid WHERE videos.url='" + url + "'";

		db.query(sql, function (error, rows, fields) { renderVideo(req, res, { error: error, rows: rows, fields: fields }, otherid, embed); });
	}


	function renderVideo(req, res, results, otherid, embed) {
		var video;
		var relatedVideos;
		var view = {};
		var sql;

		if (results.error) throw results.error;

		if (results.rows.length === 0) {
			if (embed) {
				view.title = "Unknown Video";
				res.render("embedUnknownVideo", { view: view, settings: appSettings });
			} else {
				res.render("unknownVideo", { settings: appSettings }, function (error, html) {
					if (error) throw error;
					res.json({ html: html, title: "Unknown Video" + appSettings.siteTitlePost });
				});
			}
			return;
		}

		view = results.rows[0];
		view.otherid = otherid;
		view.altNames = [];

		for (var i = 0, len = results.rows.length; i < len; i++) {
			if (view.otherid !== null && results.rows[i].otherid == otherid) view.refName = results.rows[i].othername;
			if (results.rows[i].othername !== null) view.altNames.push(results.rows[i].othername);
		}

		if (embed) {
			view.title = view.refName ? view.name + "(" + view.refName + ")" : view.name;
			view.url = appSettings.siteUrl + "videos/";
			res.render("embedVideo", { view: view, settings: appSettings });
		} else {
			getRelatedVideos(req, view);
			// Similar videos. Build first for if no related videos.
			sql = "(SELECT * FROM (SELECT name, url, image, null as otherid FROM videos WHERE name<>'" + view.name + "' AND difficulty=" + view.difficulty + " AND strength=" + view.strength + " AND flexibility=" + view.flexibility + " AND invert=" + view.invert + " AND SPIN=" + view.spin + " AND transition=" + view.transition + " ORDER BY RAND()) AS t1) UNION" +
				"(SELECT * FROM (SELECT name, url, image, null as otherid FROM videos WHERE name<>'" + view.name + "' AND difficulty=" + view.difficulty + " AND (strength=" + view.strength + " OR flexibility=" + view.flexibility + " OR invert=" + view.invert + " OR spin=" + view.spin + " OR transition=" + view.transition + ") ORDER BY RAND()) AS t2) LIMIT " + appSettings.maxRelatedVideos;
			db.query(sql, function (error, rows, fields) { renderVideoMain(req, res, { error: error, rows: rows, fields: fields }, view); });
		}
	}


	// Main video

	function renderVideoMain(req, res, results, view) {
		view.similarVideos = [];

		for (var i = 0, len = results.rows.length; i < len; i++) {
			view.similarVideos.push(new VideoItem(results.rows[i].name, results.rows[i].url, results.rows[i].image, results.rows[i].otherid));
		}

		if (!view.videos) {
			// And use similar videos for related videos list. This video = first video on list. Use other name if that's to what was linked.
			view.videos = [new VideoItem(view.refName || view.name, view.url, view.image, view.otherid)];
			view.videos = view.videos.concat(view.similarVideos);
			view.count = view.videos.length;
		}

		view.start = 0;
		view.end = Math.min(view.count, appSettings.batchSize);
		// Limit similar videos to at most 7. Got more results so could use for related videos.
		view.similarVideos.length = appSettings.maxSimilarVideos;

		db.addModelHelpers();

		res.render("video", { view: view, settings: appSettings }, function (error, html) {
			var data = {};

			if (error) throw error;

			data.html = html;
			data.videoIdx = view.videoIdx || 0;
			data.count = view.count;
			data.title = view.name + appSettings.siteTitlePost;
			data.image = appSettings.siteUrl + "images/full/" + view.image;
			data.url = appSettings.siteUrl + "videos/";
			data.video = view.video;

			renderVideoSide(req, res, view, data);
			//$data['url'] = site_url('placeholder/videos/index.php?file=');
		});
	}


	// Related videos list on the side

	function renderVideoSide(req, res, view, data) {
		res.render("search", { view: view, settings: appSettings }, function (error, html) {
			if (error) throw error;

			db.deleteModelHelpers();
			data.relatedHtml = html;
			res.json(data);
		});
	}

	// Return related videos for list at the side.

	function getRelatedVideos(req, view) {
		var videosList;

		// If the current search results cache is valid, use it.
		if (crumbs.cacheValid(req) && req.session.videosList) {
			videosList = req.session.videosList;

			if (videosList.length && typeof videosList !== "string") {
				view.videos = videosList;
				view.count = videosList.length;

				// Find index of current video.
				for (var i = 0, len = videosList.length; i < len; i++) {
					if ((!view.otherid && !videosList[i].otherid && videosList[i].url == view.url) || (view.otherid && videosList[i].otherid == view.otherid && videosList[i].url == view.url)) {
						if (i > 0) view.prev = videosList[i - 1];
						if (i < videosList.length - 1) view.next = videosList[i + 1];
						view.videoIdx = i;
						break;
					}
				}
			}
		} else {
			// Clear videos list.
			delete req.session.videosList;
		}
	}

	return exports;
}

module.exports = video;