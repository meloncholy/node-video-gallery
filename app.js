/*!
* Video Gallery - now in Node.js
*
* @package    VideoGallery
* @subpackage app
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

// Includes some code written by others; see rest of source for credits and licence details (though it's all permissive).

"use strict";

// There must be a better way to do this.
global.appPath = __dirname;

var express = require("express");
var database = require(__dirname + "/models/database");
var config = require("konphyg")(__dirname + "/config/");

var routes = {};
routes.index = require("./routes/index");
routes.search = require("./routes/search");
routes.video = require("./routes/video");
routes.feedback = require("./routes/feedback");
routes.streamer = require("./routes/streamer");

var app = module.exports = express.createServer();

routes.search.app = app;

app.configure(function () {
	app.set("env", config("app").mode);
	app.set("views", __dirname + "/views");
	app.set("view engine", "jade");
	// Stop using layout.jade as mostly just returning JSON
	app.set("view options", { layout: false });

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: config("app").sessionSecret }));
	app.use(app.router);
	app.use(express.static(__dirname + "/public"));

	app.set("vgSettings", { app: config("app"), database: config("database") });
	app.set("vgDatabase", database(app.settings));

	// Instantiate routes now have app.settings (specifically )
	routes.index = routes.index(app.settings);
	routes.search = routes.search(app.settings);
	routes.video = routes.video(app.settings);
	routes.feedback = routes.feedback(app.settings);
});

app.configure("development", function() {
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure("production", function() {
	app.use(express.errorHandler());
});


// Routes

app.get("/", routes.index.index);

app.post("/search/", routes.search.index);
app.post("/search/autosuggest/", routes.search.autosuggest);
app.post("/search/batch/", routes.search.batch);

app.post("/video/load/", routes.video.index);
app.post("/video/load/:url/:otherid?/?", routes.video.load);
app.get("/embed/", routes.video.noVideoEmbed);
app.get("/embed/:url/:otherid?/?", routes.video.embed);

app.post("/feedback/name/", routes.feedback.name);
app.post("/feedback/submit_name/", routes.feedback.submitName);
app.post("/feedback/contact/", routes.feedback.contact);
app.post("/feedback/submit_contact/", routes.feedback.submitContact);

app.get(/\/((images\/(thumb|full)\/.+)|(videos\/.+))\/?/, routes.streamer);

app.listen(config("app").localPort);
console.log("We're up on port %d in %s mode.", app.address().port, app.settings.env);
