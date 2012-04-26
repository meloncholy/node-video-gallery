/**
* Site home.

* @package    VideoGallery
* @subpackage routes.index
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

"use strict";

function index(settings) {
	var exports = {};
	var appSettings = settings.vgSettings.app;

	exports.index = function (req, res) {
		res.render("index", { layout: "layout", settings: appSettings });
	};

	return exports;
}

module.exports = index;
