/**
* Simple cookie class for storing video player size and whether moves cache is valid.
*
* @package    VideoGallery
* @subpackage models.crumbs
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

"use strict";

var crumbs = module.exports;


// See if other videos cache is still valid.
// Set false by browser if resize window or on search.
// Set true here on search.

crumbs.cacheValid = function (req) {
	var vgcrumbs = req.cookies.vgcrumbs;

	if (vgcrumbs) return vgcrumbs.split(";")[1] == "true";
	return false;
};


// Mark moves cache as valid and create cookie if there isn't one.

crumbs.setCacheValid = function (req, res) {
	var vgcrumbs = req.cookies.vgcrumbs;

	res.cookie("vgcrumbs",
		vgcrumbs ? vgcrumbs.split(";")[0] + ";true" : "Medium;true",
		{ expires: 0, path: "/" }
	);
};
