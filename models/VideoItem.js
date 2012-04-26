/**
* VideoItem object for storing, um, video items retreived from the DB.

* @package    VideoGallery
* @subpackage models.VideoItem
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

"use strict";

function VideoItem(name, url, image, otherid) {
	this.name = name;
	this.url = url;
	this.image = image;
	this.otherid = otherid;
};

module.exports = VideoItem;