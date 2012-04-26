/**
* Feedback forms (new name & contact) controller.
* 
* @package    VideoGallery
* @subpackage routes.feedback
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

"use strict";

var sanitize = require("validator").sanitize;

function feedback(settings) {
	var appSettings = settings.vgSettings.app;
	var exports = {};
	var db = settings.vgDatabase;


	// Show new name for video form.

	exports.name = function (req, res) {
		var view = {};

		try {
			view.url = sanitize(req.body.url).xss();
			view.name = sanitize(req.body.name).xss();
		} catch (e) {
			console.log("Exception: feedback exports.name " + e);
			return;
		}

		res.render("suggestName", { view: view }, function (error, html) {
			var data = {};

			if (error) throw error;

			data.html = html;
			data.title = "Suggest a Name" + appSettings.siteTitlePost;
			res.json(data);
		});
	};


	// Save new name for the video and show thank you form.

	exports.submitName = function (req, res) {
		var sql;
		var url, name, suggestion, comment, author, email;

		try {
			url = db.escape(sanitize(req.body.url).xss());
			name = db.escape(sanitize(req.body.name).xss());
			suggestion = db.escape(sanitize(req.body.suggestion).xss());
			comment = db.escape(sanitize(req.body.comment).xss());
			author = db.escape(sanitize(req.body.author).xss());
			email = db.escape(sanitize(req.body.email).xss());
		} catch (e) {
			console.log("Exception: feedback exports.submitName " + e);
			return;
		}

		sql = "INSERT INTO suggestions (url, name, suggestion, comment, author, email) VALUES ('" + url + "', '" + name + "', '" + suggestion + "', '" + comment + "', '" + author + "', '" + email + "');";
		db.query(sql, function (error, rows, fields) {
			submitNameRender(req, res, { error: error, rows: rows, fields: fields }, name);
		});
	};


	function submitNameRender(req, res, results, name) {
		var view = { name: name };

		if (results.error) {
			console.log(results.error);
			return;
		}

		res.render("suggestNameThanks", { view: view }, function (error, html) {
			var data = {};

			if (error) throw error;

			data.html = html;
			data.title = "Suggest a Name" + appSettings.siteTitlePost;
			res.json(data);
		});
	}


	// Show contact form.

	exports.contact = function (req, res) {
		res.render("contact", { settings: appSettings }, function (error, html) {
			var data = {};

			if (error) throw error;

			data.html = html;
			data.title = "Contact" + appSettings.siteTitlePost;
			res.json(data);
		});
	};


	// Accept contact form and show thank you form.

	exports.submitContact = function (req, res) {
		var sql;
		var comment, author, email;

		try {
			comment = db.escape(sanitize(req.body.comment).xss());
			author = db.escape(sanitize(req.body.author).xss());
			email = db.escape(sanitize(req.body.email).xss());
		} catch (e) {
			console.log(e);
			return;
		}

		sql = "INSERT INTO contact (comment, author, email) VALUES ('" + comment + "', '" + author + "', '" + email + "');";
		db.query(sql, function (error, rows, fields) {
			submitContactRender(req, res, { error: error, rows: rows, fields: fields });
		});
	};


	function submitContactRender(req, res, results) {
		if (results.error) {
			console.log(results.error);
			return;
		}

		res.render("contactThanks", function (error, html) {
			var data = {};

			if (error) throw error;

			data.html = html;
			data.title = "Contact" + appSettings.siteTitlePost;
			res.json(data);
		});
	}

	return exports;
}

module.exports = feedback;
