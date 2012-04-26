/**
* Video search and browse

* @package    VideoGallery
* @subpackage routes.index
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

"use strict";

var sanitize = require("validator").sanitize;
var helper = require(global.appPath + "/models/helper");
var spell = require(global.appPath + "/models/spell");
var crumbs = require(global.appPath + "/models/crumbs");
var porterStemmer = require(global.appPath + "/models/porterStemmer");
var VideoItem = require(global.appPath + "/models/VideoItem");

function search(settings) {
	var exports = {};
	var db = settings.vgDatabase;
	var appSettings = settings.vgSettings.app;

	// Dictionary of video names (for spell checking)
	spell = spell(settings);


	// Search for videos

	exports.index = function (req, res) {
		var out = { videos: [], altVideos: [], filtersVideos: [] };
		var query = {};

		if (typeof req.body.search !== "string" || (typeof req.body.filters !== "object" && req.body.filters !== "null")) return;
		// Want to escape LIKE wildcards in the query, but not if saying that string wasn't found in an error.
		query.unescapedSearch = sanitize(req.body.search).xss();
		query.search = db.escape(query.unescapedSearch, true);
		query.filters = db.escape(sanitize(req.body.filters).xss());

		if (query.filters === "null") {
			query.filters = undefined;
		} else {
			/*for (var i in query.filters) {
			if (query.filters.hasOwnProperty(i) && query.filters[i] === "null") query.filters[i] = null;
			}*/
			Object.keys(query.filters).forEach(function (name) {
				if (query.filters[name] === "null") query.filters[name] = null;
			});
		}

		if (query.search) {
			buildQuery(req, res, query, out);
		} else if (query.filters) {
			query.sql = buildFiltersQuery(query.filters);
			query.outstanding = 1;
			db.query(query.sql, function (error, rows, fields) { renderResults(req, res, { error: error, rows: rows, fields: fields }, query, out, "videos"); });
		} else {
			query.sql = buildBrowseQuery();
			query.outstanding = 1;
			db.query(query.sql, function (error, rows, fields) { renderResults(req, res, { error: error, rows: rows, fields: fields }, query, out, "videos"); });
		}
	};


	// Search part 2

	function renderResults(req, res, results, query, out, outProp) {
		var view = {};

		if (results.error) throw results.error;
		out[outProp] = results.rows;
		if (--query.outstanding) return;

		out.count = out.videos.length;

		if (out.videos.length === 0) {
			if (out.altVideos.length > 0) {
				view.error = true;
				view.altVideos = true;
			} else if (out.filtersVideos.length > 0) {
				view.error = true;
				view.filtersVideos = true;
			} else {
				view.error = true;
				view.noVideos = true;
			}
		} else if (out.videos.length < 3 && out.altVideos.length > 2 * out.videos.length) {
			view.warning = true;
			view.fewVideos = true;
		}

		if (out.altVideos.length !== 0) {
			view.videos = helper.Array.unique(out.videos.concat(out.altVideos));
		} else {
			view.videos = out.videos;
		}

		out.mergedCount = view.videos.length;

		view.start = 0;
		view.end = Math.min(view.videos.length, appSettings.batchSize);

		db.addModelHelpers();

		req.session.sql = query.sql;
		req.session.altSql = query.altSql;
		req.session.count = out.count;
		req.session.mergedCount = out.mergedCount;
		req.session.videosList = [];

		for (var i = 0, len = view.videos.length; i < len; i++) {
			req.session.videosList.push(new VideoItem(view.videos[i].name, view.videos[i].url, view.videos[i].image, view.videos[i].otherid));
		}

		crumbs.setCacheValid(req, res);

		res.render("search", { view: view, settings: appSettings }, function (err, html) {
			var data = {};

			db.deleteModelHelpers();
			data.html = html;
			data.start = view.start;
			data.end = view.end;
			data.count = view.videos.length;
			data.videoIdx = 0;

			renderAlerts(res, query, view, data);
		});
	}


	// Search part 3

	function renderAlerts(res, query, view, data) {
		if (view.error) {
			res.render("batchAlerts", { view: view, query: query }, function (err, html) {
				if (err) throw err;
				data.error = html;
				res.json(data);
			});
		} else if (view.warning) {
			res.render("batchAlerts", { view: view, query: query }, function (err, html) {
				if (err) throw err;
				data.warning = html;
				res.json(data);
			});
		} else {
			res.json(data);
		}
	}

	
	// Query builder helper. Will search database for
	// - Phrase entered
	// - Words entered in any combination
	// - Spelling suggestions on words entered
	// arranged in a hopefully useful order

	function buildQuery(req, res, query, out) {
		query.cleanSearch = cleanString(query.search);
		// Make array for word (not phrase) search.
		query.words = query.cleanSearch.split(" ");
		db.query(spellQuery(query.cleanSearch), function (error, rows, fields) { buildQuerySpell(req, res, { error: error, rows: rows, fields: fields }, query, out); });
	}

	
	// Query builder helper part 2

	function buildQuerySpell(req, res, results, query, out) {
		var joinedWordsSets;
		var splitWordsSets = [];

		// Exact match? If not, find splits & joins.
		if (results.rows.length === 0) {
			joinedWordsSets = spell.join(query.words);

			for (var i = 0, ilen = joinedWordsSets.length; i < ilen; i++) {
				for (var j = 0, jlen = joinedWordsSets[i].length; j < jlen; j++) {
					splitWordsSets.push(spell.split(joinedWordsSets[i][j]));
				}
			}

			query.splitWordsList = spell.joinAlts(splitWordsSets);
			db.query(spellCount(query.splitWordsList), function (error, rows, fields) { buildQuerySpellCounts(req, res, { error: error, rows: rows, fields: fields}, query, out); });
		} else {
			query.sql = buildQuery2(query.cleanSearch, query.words, query.filters);

			if (query.filters) {
				query.filtersSql = buildQuery2(query.cleanSearch, query.words, query.filters, true);
			}
		}
	}


	// Query builder helper part 3

	function buildQuerySpellCounts(req, res, results, query, out) {
		var altWords;
		var correct;
		var correctCount;
		var bestCorrect;
		var bestIdx = 0;
		var spellChecked;

		for (var i = 0, len = results.rows.length; i < len; i++) {
			// Match
			if (results.rows[i].count !== 0) {
				altWords = query.splitWordsList[i];
				query.altSearch = altWords.join(" ");
				break;
			}
		}

		if (!altWords) {
			for (var i = 0, len = query.splitWordsList.length; i < len; i++) {
				correctCount = 0;

				for (var j = 0, listLen = query.splitWordsList[i].length; j < listLen; j++) {
					spellChecked = spell.correct(query.splitWordsList[i][j]);
					query.splitWordsList[i][j] = spellChecked.word;
					correctCount += spellChecked.match;
				}

				correct = correctCount / query.splitWordsList[i].length;

				if (correct > bestCorrect) {
					bestCorrect = correct;
					bestIdx = i;
				}
			}

			altWords = query.splitWordsList[bestIdx];
			query.altSearch = altWords.join(" ");
		}

		query.sql = buildQuery2(query.cleanSearch, query.words, query.filters);

		if (altWords) {
			query.altSql = buildQuery2(query.altSearch, altWords, query.filters);
		}

		// If have filters, the no filters check uses altWords if available for widest possible match.
		if (query.filters) {
			if (altWords) {
				query.filtersSql = buildQuery2(query.altSearch, altWords, query.filters, true);
			} else {
				query.filtersSql = buildQuery2(query.cleanSearch, query.words, query.filters, true);
			}
		}

		// Number of queries need to return before can continue.
		query.outstanding = 1;
		db.query(query.sql, function (error, rows, fields) { renderResults(req, res, { error: error, rows: rows, fields: fields }, query, out, "videos"); });

		if (query.altSql) {
			query.outstanding++;
			db.query(query.altSql, function (error, rows, fields) { renderResults(req, res, { error: error, rows: rows, fields: fields }, query, out, "altVideos"); });
		}

		if (query.filters) {
			query.outstanding++;
			db.query(query.filtersSql, function (error, rows, fields) { renderResults(req, res, { error: error, rows: rows, fields: fields }, query, out, "filtersVideos"); });
		}
	}


	// Despite the name, query builder helper part 4

	function buildQuery2(search, words, filters, filtersCheck) {
		var sql = "";
		var stemSearch = search;
		var stemWords = [];
		var tableIdx = { idx: 0 };

		// Stem words
		for (var i = 0, len = words.length; i < len; i++) {
			stemWords[i] = porterStemmer(words[i]);
		}

		// Sort arrays so get matches to largest words first
		if (words.length > 1) words = words.sort(helper.Array.sortByLength);
		if (stemWords.length > 1) stemWords = stemWords.sort(helper.Array.sortByLength);

		if (words.length > 1 && !filtersCheck) {
			sql = queryChunk(tableIdx, [search], filters, filtersCheck);
		}

		sql += queryChunk(tableIdx, words, filters, filtersCheck, stemWords);

		// Remove last " UNION "
		return sql.substring(0, sql.length - 7);
	}


	// If just have filters, use a simple query.

	function buildFiltersQuery(filters) {
		var queryFilters = queryFiltersBuilder(filters);

		return "(SELECT id, null AS otherid, name, searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos WHERE (true" + queryFilters + ") " +
		"UNION (SELECT videos.id, othernames.id AS otherid, othernames.name AS name, othernames.searchname AS searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos, othernames WHERE videos.id = othernames.videoid AND (true" + queryFilters + ") ORDER BY searchname";
	}


	// If browsing the videos, use an even simpler query.

	function buildBrowseQuery() {
		return "(SELECT id, null AS otherid, name, searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos) " +
		"UNION (SELECT videos.id, othernames.id AS otherid, othernames.name AS name, othernames.searchname AS searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos, othernames WHERE videos.id = othernames.videoid) ORDER BY searchname";
	}


	// Get autosuggest results.

	exports.autosuggest = function (req, res) {
		var query = {};
		var queryFilters;

		if (typeof req.body.search !== "string" || typeof req.body.filters !== "string") {
			renderAutosuggest(res, { error: undefined, rows: [], fields: [] });
			return;
		}

		query.search = db.escape(sanitize(req.body.search).xss(), true);
		query.filters = db.escape(sanitize(req.body.filters).xss());

		if (query.filters === "null" || query.filters === "") {
			query.filters = undefined;
			queryFilters = ")";
		} else {
			/*for (var i in query.filters) {
			if (query.filters.hasOwnProperty(i) && query.filters[i] === "null") query.filters[i] == null;
			}*/
			Object.keys(query.filters).forEach(function (name) {
				if (query.filters[name] === "null") query.filters[name] = null;
			});

			queryFilters = queryFiltersBuilder(query.filters);
		}

		// Query sorts all results by name, so alt names can come before proper names. ***BUG***
		query.sql = "(SELECT searchname FROM videos WHERE (searchname LIKE '" + query.search + "%'" + queryFilters +
		") UNION (SELECT othernames.searchname AS searchname FROM videos, othernames WHERE (videos.id = othernames.videoid AND othernames.searchname LIKE '" + query.search + "%'" + queryFilters + ") ORDER BY searchname LIMIT 1";

		db.query(query.sql, function (error, rows, fields) { renderAutosuggest(res, { error: error, rows: rows, fields: fields }); });
	};


	function renderAutosuggest(res, results) {
		var data = {};

		if (results.error) throw results.error;

		if (results.rows.length === 0) {
			data.autosuggest = "";
		} else {
			data.autosuggest = results.rows[0].searchname;
		}

		res.json(data);
	}


	// Get the next batch of videos from results already returned from the DB (for infinite scroll).

	exports.batch = function (req, res) {
		var view = {};

		if ((view.start = parseInt(sanitize(req.body.offset).xss())) && (view.videos = req.session.videosList)) {
			view.videos = req.session.videosList;
			//view.count = out.mergedCount;
			view.end = Math.min(req.session.mergedCount, view.start + appSettings.batchSize);
			db.addModelHelpers();

			res.render("search", { view: view, settings: appSettings }, function (error, html) {
				var data = {};

				db.deleteModelHelpers();

				data.html = html;
				data.start = view.start;
				data.end = view.end;
				res.json(data);
			});
		} else {
			res.render("browseError", function (error, html) {
				var data = {};

				data.error = html;
				res.json(data);
			});
		}
	};

/*	exports.batch = function (req, res) {
		var query = {};
		var out = {};

		if ((out.offset = parseInt(sanitize(req.body.offset).xss())) && (query.sql = req.session.sql)) {
			query.altSql = req.session.altSql;
			out.count = req.session.count;
			out.mergedCount = req.session.mergedCount;
			query.outstanding = 0;

			if (out.offset < out.count) {
				query.outstanding++;
				db.query(query.sql, function (error, rows, fields) { renderBatch(res, { error: error, rows: rows, fields: fields }, query, out, "videos"); });
			}

			if (out.offset + appSettings.batchSize >= out.count && out.mergedCount > out.count) {
				query.outstanding++;
				db.query(query.altSql, function (error, rows, fields) { renderBatch(res, { error: error, rows: rows, fields: fields }, query, out, "altVideos"); });
			}
		} else {
			res.render("browseError", function (err, html) {
				var data = {};

				data.error = html;
				res.json(data);
			});

		}
	}

	var renderBatch = function (res, results, query, out, name) {
		var view = {};

		if (results.error) throw results.error;

		out[name] = results.rows;
		if (--query.outstanding > 0) return;

		if (out.videos && out.altVideos) {
			out.videos = helper.Array.unique(out.videos.concat(out.altVideos));
		} else if (out.altVideos) {
			out.videos = out.altVideos;
			out.offset -= out.count;
			out.mergedCount -= out.count;
		}

		view.videos = out.videos;
		//view.count = out.mergedCount;
		view.start = out.offset;
		view.end = Math.min(out.mergedCount, out.offset + appSettings.batchSize);

		res.render("search", { view: view }, function (err, html) {
			var data = {};

			data.html = html;
			data.start = view.start;
			data.end = view.end;
			res.json(data);
		});
	};*/

	// Clean up search string: remove diacritics, replace / remove other unwanted characters.
	// Probably needs changing for different languages.

	function cleanString(search) {
		// Change accented characters to non-accented equivalents.
		search = helper.String.removeDiacritics(search).toLowerCase();

		// stemSearch keeps some apostrophes for stemming -- though don't appear to be using it???
		/*if (stemSearch) {
		// Strip apostrophes except when in 've, n't, 'd. Doesn't actually work, as leaves .'t, not just n't.
		stemSearch = search.replace(/`|'(?!(ve|d|t[^a-z]))|^\s+|\s+$/g, "").replace(/[^a-z'\s]|\s{2,}/g, " ");
		}*/

		// Strip anything that's not a-z or whitespace (punctuation, numbers, etc.), trim whitespace, strip excess whitespace.
		search.replace(/['`]|^\s+|\s+$/g, "").replace(/[^a-z\s]|\s{2,}/g, " ");

		// If word to remove at start or end, now have extra space. I'm sure there's a way to do this with a regex.
		search = helper.String.removeUnwantedWords(search).trim();
		//if (stemSearch) stemSearch = helper.String.removeUnwantedWords(stemSearch).trim();
		return search;
	}


	// Query builder helper helper. Constructs subqueries that are then combined to return results in the order required.

	function queryChunk(tableIdx, words, filters, filtersCheck, stemWords) {
		var nameField = "searchname";
		var otherNameField = "othernames.searchname";
		var queryPreName = "(SELECT * FROM (SELECT id, null AS otherid, name, searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos WHERE ((";
		var queryPreOtherName = "(SELECT * FROM (SELECT videos.id, othernames.id AS otherid, othernames.name AS name, othernames.searchname AS searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos, othernames WHERE videos.id = othernames.videoid AND ((";
		var queryPost1 = ") ORDER BY searchname) AS t";
		var queryPost2 = ") UNION ";
		var sql = "";
		var queryFilters = filtersCheck ? ") " : queryFiltersBuilder(filters);
		var orStemWords;

		// Stemmed words will either be the same as original or with end cut off, so use stemmed in LIKEs.
		if (typeof stemWords === "undefined") stemWords = words;

		// Remove single char words for OR sections
		for (var w = stemWords.length; w > 0 && stemWords[--w].length === 1; );
		orStemWords = stemWords.slice(0, w + 1);

		if (!filtersCheck) {
			if (words.length === 1) {
				sql += "(SELECT * FROM (SELECT id, null AS otherid, name, searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos WHERE ((" + nameField + "='" + words[0] + "'" + queryFilters + queryPost1 + tableIdx.idx++ + queryPost2;
				sql += "(SELECT * FROM (SELECT videos.id, othernames.id AS otherid, othernames.name AS name, othernames.searchname AS searchname, difficulty, strength, flexibility, invert, spin, transition, url, image FROM videos, othernames WHERE videos.id = othernames.videoid AND ((" + otherNameField + "='" + words[0] + "'" + queryFilters + queryPost1 + tableIdx.idx++ + queryPost2;
			} else {
				sql += queryAndBuilder(tableIdx, stemWords, nameField, queryPreName, queryPost1, queryPost2, queryFilters);
				sql += queryAndBuilder(tableIdx, stemWords, otherNameField, queryPreOtherName, queryPost1, queryPost2, queryFilters);
				sql += queryLastLikeBuilder(tableIdx, stemWords, nameField, queryPreName, queryPost1, queryPost2, queryFilters, "AND");
				sql += queryLastLikeBuilder(tableIdx, stemWords, otherNameField, queryPreOtherName, queryPost1, queryPost2, queryFilters, "AND");
			}

			for (var w = 1, len = orStemWords.length; w <= len; w++) {
				sql += queryOrBuilder(tableIdx, orStemWords, nameField, queryPreName, queryPost1, queryPost2, queryFilters, w);
				sql += queryOrBuilder(tableIdx, orStemWords, otherNameField, queryPreOtherName, queryPost1, queryPost2, queryFilters, w);
			}
		}

		if (orStemWords.length > 1 || filtersCheck) {
			sql += queryLastLikeBuilder(tableIdx, orStemWords, nameField, queryPreName, queryPost1, queryPost2, queryFilters, "OR");
			sql += queryLastLikeBuilder(tableIdx, orStemWords, otherNameField, queryPreOtherName, queryPost1, queryPost2, queryFilters, "OR");
		}

		return sql;
	}


	// Helper function that returns SQL for active filters.

	function queryFiltersBuilder(filters) {
		var sql = "";

		if (filters) {
			/*for (var i in filters) {
			if (filters.hasOwnProperty(i) && filters[i] !== null) sql += " AND " + i + "='" + filters[i] + "'";
			}*/
			Object.keys(filters).forEach(function (name) {
				if (filters[name] !== null) sql += " AND " + name + "='" + filters[name] + "'";
			});
		}

		return ") " + sql;
	}

	
	// Query builder helper helper helper.

	function queryAndBuilder(tableIdx, words, field, queryPre, queryPost1, queryPost2, queryFilters) {
		var sql = "";

		for (var i = 0, len = words.length; i < len; i++) {
			sql += queryPre + field + " LIKE '" + words[i] + "%' ";

			for (var j = 0; j < len; j++) {
				if (j !== i) sql += " AND " + field + " LIKE '%" + words[j] + "%' ";
			}

			sql += queryFilters + queryPost1 + tableIdx.idx++ + queryPost2;
		}

		return sql;
	}


	// Another query builder helper helper helper.

	function queryOrBuilder(tableIdx, words, field, queryPre, queryPost1, queryPost2, queryFilters, wordCount) {
		var sql = "";
		var orPre = ["", "%"];
		var orPost = ["%", "%"];

		for (var i = 0, len = orPre.length; i < len; i++) {
			sql += queryPre;

			for (var j = 0; j < wordCount; j++) {
				sql += field + " LIKE '" + orPre[i] + words[j] + orPost[i] + "' OR ";
			}

			// Remove last " OR "
			sql = sql.substring(0, sql.length - 4) + queryFilters + queryPost1 + tableIdx.idx++ + queryPost2;
		}

		return sql;
	}


	// Last query builder helper helper helper.

	function queryLastLikeBuilder(tableIdx, words, field, queryPre, queryPost1, queryPost2, queryFilters, junct) {
		var sql = queryPre;

		for (var i = 0, len = words.length; i < len; i++) {
			sql += field + " LIKE '%" + words[i] + "%' " + junct + " ";
		}
		// Remove last " AND " or " OR "
		return sql.substring(0, sql.length - junct.length - 2) + queryFilters + queryPost1 + tableIdx.idx++ + queryPost2;
	}


	// Query to see if search phrase / word exists, or if need to spell check.

	function spellQuery(search) {
		return "(SELECT id, null AS otherid, name FROM videos WHERE name='" + search + "')" +
		"UNION (SELECT videos.id, othernames.id AS otherid, othernames.name AS name FROM videos, othernames WHERE videos.id = othernames.videoid AND othernames.name='" + search + "')";
	}

	
	// Number of matches for each alt phrase.

	function spellCount(searchAlts) {
		var sql = "";

		// Get count from each subquery so only do 1 query
		for (var i = 0, len = searchAlts.length; i < len; i++) {
			sql += "(SELECT " + i + " as idx, COUNT(*) AS count FROM (" + spellQuery(searchAlts[i].join(" ")) + ") AS t" + i + ") UNION ";
		}

		// Remove " UNION "
		return sql.substring(0, sql.length - 7);
	}

	return exports;
}

module.exports = search;
