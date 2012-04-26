Video Gallery
==============

A Metro-style video gallery with Ajax, infinite scroll and other fun stuff. Now rewritten in Node.js. 

There's a load of bumf about the [original PHP version here](http://meloncholy.com/portfolio/video-gallery/) (mostly relevant) and some supplementary info about [this version here](http://meloncholy.com/portfolio/node-video-gallery/). 

[http://bits.meloncholy.com/node-video-gallery/](Demo site)

The front end code is (almost) identical to that in the PHP version. It could do with updating a bit, e.g. to use the HTML5 history API rather than `#!` and moving the jQuery events over to `on`. But other than that it works fine. 


Settings
--------

You'll need to set up a MySQL database first (see sample content below). Then there are some configuration things to do

`/config/app.json` (Please rename `app-sample.json`.)

- **localPort** - Local port to use
- **sessionSecret** - Session secret for Express
- **siteUrl** - Public URL for your site
- **mode** - *development* or *production*. *development* gives more error messages, while *production* uses minimized, combined public JS files that load a lot faster.
- **batchSize** - Number of videos to load at once in infinite scroll.
- **videoCount** - Approximate number of videos in the database. Just used for bragging rights in a few places.
- **cookiePath** - Cookie path to use. Unless you want to restrict it to a subfolder, I'd suggest using `/`.
- **siteTitle** - Name of the site. Used in browser title bar and elsewhere. 
- **siteTitlePost** - Text to stick in the title bar after the video name (where appropriate).
- **siteDescription** - Meta description content.
- **maxRelatedVideos** - If we haven't come via a search (via a link or refresh), show this many related videos at the side of a video.
- **maxSimilarVideos** - Show this many similar videos at the bottom of a video. See video.js for more. This number should obviously work for the largest video size offered.
- **prettyLink** - Prepend this to each video's URL for SEO, so if this were `amazing-stunts`, the URLs would be something like `http://example.com/#!amazing-stunts/name-of-this-video`.
- **jQueryCdnUrl** - In *production* mode, load jQuery from here.
- **gaAccount** - Your Google Analytics UA number.
- **gaDomain** - Your Analytis domain. 

Example

```javascript
{
	"localPort": 3000,
	"sessionSecret": "session secret",
	"siteUrl": "http://bits.meloncholy.com/node-video-gallery/",
	"mode": "development",
	"batchSize": 20,
	"videoCount": 300,
	"cookiePath": "/",
	"siteTitle": "Video Gallery",
	"siteTitlePost": " | Video Gallery",
	"siteDescription": "This Video Gallery is a web app with lots of jQuery and Node goodness. Yum.",
	"maxRelatedVideos": 19,
	"maxSimilarVideos": 7,
	"prettyLink": "video",
	"jQueryCdnUrl": "http://ajax.googleapis.com/ajax/libs/jquery/1.6.4/jquery.min.js",
	"gaAccount": "UA-XXXXXXXX-X",
	"gaDomain": "meloncholy.com"
}
```

`/config/database.json`

- **host** - Database host
- **database** - Database name
- **user** - Database user
- **password** - Database password

Example

```javascript
{
	"host": "localhost",
	"database": "database",
	"user": "user",
	"password": "password"
}
```

Dependencies
------------

To get it to work, you'll also need

- [Express](https://github.com/visionmedia/express)
- [Jade](https://github.com/visionmedia/jade)
- [Konphyg](https://github.com/pgte/konphyg)
- [VidStreamer.js](https://github.com/meloncholy/vid-streamer)


Sample content
--------------

If you want to get going quickly, you can use the sample videos, photos and database from the [PHP Video Gallery](https://github.com/meloncholy/video-gallery) (placeholder and database folders resp.). 

And try something like this for `vidStreamer.json` (in `/node_modules/vid-streamer/config`) to get it to serve up the sample content. 

```javascript
{
	"mode": "development",
	"forceDownload": false,
	"random": true,
	"rootFolder": "/path/to/express/public/",
	"rootPath": "node-video-gallery/",
	"server": "VidStreamer.js/0.1"
}
```


Legal fun
---------

Copyright &copy; 2012 Andrew Weeks http://meloncholy.com

Video Gallery is licensed under the [MIT licence](http://meloncholy.com/licence/). 

Includes some code written by others; see source for credits and licence details (though it's all permissive).


Thanks
------

The download includes Longtail Video's [JW Player](http://www.longtailvideo.com/), released under Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0) licence. Commercial licences are also available. You're of course welcome to swap the player for another one if you don't like it, though you'll need to change some of the source files that set up parameters to pass to the player. 

The sample video footage comprises some short video clips and still images of these video clips by [Catrin Hedstr&ouml;m](http://www.theycallusanimals.com/) and released under a Attribution-NonCommercial-ShareAlike 3.0 Unported (CC BY-NC-SA 3.0) licence. It's gorgeous footage too - do check it out!


Me
--
I have a [website](http://meloncholy.com) and a [Twitter](https://twitter.com/meloncholy). Please come and say hi if you'd like or if something's not working; be lovely to hear from you. 
