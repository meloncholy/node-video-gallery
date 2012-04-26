/**
* Some database helper functions.
*
* @package    VideoGallery
* @subpackage models.database
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

"use strict";

var mysql = require("mysql");

function database(settings) {
	var exports;
	var appSettings = settings.vgSettings.app;
	var dbSettings = settings.vgSettings.database;

	exports = mysql.createClient({
		host: dbSettings.host,
		database: dbSettings.database,
		user: dbSettings.user,
		password: dbSettings.password
	});


	// Define some properties to avoid clogging the Jade view with gunk.
	// These *MUST NOT* be enumerable or Jade view (express\lib\view.js 396) and MySQL Hashish (node_modules\hashish\index.js 138) code get terribly confused.
	// I also want to make it absolutely clear that I am not actually adding stuff to Object.prototype...

	exports.addModelHelpers = function () {

		/*Object.defineProperty(Object.prototype, "prettyLink", {
		value: vgSettings.app.prettyLink,
		configurable: true,
		enumerable: false
		});*/

		Object.defineProperty(Object.prototype, "hashUrl", {
			get: function () { return "#!" + appSettings.prettyLink + "/" + this.url + (this.otherid === null ? "" : "/" + this.otherid); },
			configurable: true,
			enumerable: false
		});

		Object.defineProperty(Object.prototype, "uniqueId", {
			get: function () { return "video-" + this.url + (this.otherid === null ? "" : "-" + this.otherid); },
			configurable: true,
			enumerable: false
		});
	};


	// ...and delete the properties.

	exports.deleteModelHelpers = function () {
		//delete Object.prototype.prettyLink;
		delete Object.prototype.hashUrl;
		delete Object.prototype.uniqueId;
	};


	// Escape data being sent to database. Bit like mysql_real_escape_string, though handles a few other cases too.
	// Optional like allows LIKE queries to be escaped safely.
	// *** DOES THIS WORK FOR MULTIBYTE ATTACKS?
	// http://stackoverflow.com/questions/4877326/how-can-i-tell-if-a-string-contains-multibyte-characters-in-javascript

	exports.escape = function (data, like) {
		// Check strings & string objects, and check properties of objects that have them for strings.
		// If string has any other properties defined, will be 'deleted' here.
		if (typeof data === "string" || data.substring) {
			// Replace bad stuff with escaped hex charcodes.
			data = data.replace(/[\0\b\f\n\r\t\v\x1a"'\\]/g, function (char) { return "\\x" + char.charCodeAt(0).toString(16); });
			if (like) data = data.replace(/[%_]/g, function (char) { return "\\" + char; });
		} else {
			for (var i in data) {
				// Include prototype chain
				data[i] = exports.escape(data[i], like);
			}
		}

		return data;
	};

	return exports;
}

module.exports = database;