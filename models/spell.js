/**
* Check spelling of searches.

* @package    VideoGallery
* @subpackage models.spell
* @copyright  Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* @license    MIT licence. See http://meloncholy.com/licence for details.
* @version    0.1
*/

// Dictionary adapted from code by Vincenzo Russo, Ian Barber
// http://neminis.org/blog/research/text-mining/spelling-correction-with-soundex/

"use strict";

var helper = require(global.appPath + "/models/helper");
var fs = require("fs");

function spell(settings) {
	var exports = {};
	// Dictionaries - original & minus single letter words
	var dics = { all: {}, edit: {} };
	var db = settings.vgDatabase;

	loadDic("all", "dic");
	loadDic("edit", "dicedit");

	
	// See if a word's in the dictionary.

	exports.check = function (word) {
		return typeof dics.all[word.toLowerCase()] !== "undefined";
	};


	// Suggest correct spelling for word.
	// match == how close to correct spelling word is, roughly

	exports.correct = function (word) {
		var joinedWords;
		var edits1 = {};
		var edits2 = {};
		var dist;

		word = word.toLowerCase();

		if (typeof dics.all[word] !== "undefined") {
			return { word: word, match: 1.0 };
		}
		else if (word.length == 1) {
			return { word: word, match: 0.0 };
		}

		/*for (var dicWord in dics.edit) {
		if (dics.edit.hasOwnProperty(dicWord)) {
		dist = helper.String.levenshtein(word, dicWord);

		if (dist == 1) {
		edits1[dicWord] = dics.edit[dicWord];
		} else if (dist == 2) {
		edits2[dicWord] = dics.edit[dicWord];
		}
		}
		}*/
		Object.keys(dics.edit).forEach(function (dicWord) {
			dist = helper.String.levenshtein(word, dicWord);

			if (dist == 1) {
				edits1[dicWord] = dics.edit[dicWord];
			} else if (dist == 2) {
				edits2[dicWord] = dics.edit[dicWord];
			}
		});

		if (Object.keys(edits1).length) {
			return { word: findLast(edits1), match: 0.6 };
		} else if (Object.keys(edits2).length) {
			return { word: findLast(edits2), match: 0.3 };
		}

		// Nothing better
		return { word: word, match: 0.0 };
	};


	function findLast(words) {
		var lastVal = 0;
		var lastWord;

		/*for (var i in words) {
		if (words.hasOwnProperty(i) && words[i] > lastVal) {
		lastVal = words[i];
		lastWord = i;
		}
		}*/

		Object.keys(words).forEach(function (i) {
			if (words[i] > lastVal) {
				lastVal = words[i];
				lastWord = i;
			}
		});

		return lastWord;
	}


	// Store a new dictionary of words in the database. Only needed to update the list.
	// File = list of words or phrases to learn (one per line)

	exports.train = function (file) {
		var newDics = { all: {}, edit: {} };
		var contents;
		var matches;
		var word;

		contents = fs.readlinkSync(file);
		// Get all strings of word letters
		matches = contents.split(/\w+/);
		contents = undefined;

		for (var i = 0, len = matches.length; i < len; i++) {
			word = matches[i].toLowerCase();

			if (typeof newDics.all[word] === "undefined") {
				newDics.all[word] = 0;
			}
			newDics.all[word]++;
		}

		matches = undefined;

		/*for (var word in newDics.all) {
		if (newDics.all.hasOwnProperty(word) && newDics.all[word].length > 1) newDics.edit[word] = newDics.all[word];
		}*/
		Object.keys(newDics.all).forEach(function (word) {
			if (newDics.all[word].length > 1) newDics.edit[word] = newDics.all[word];
		});

		dics = newDics;

		saveDic("all", "dic");
		saveDic("edit", "dicedit");
	};


	// Store the new dictionary in the database (called by train)

	function saveDic(dic, table) {
		db.query("DELETE FROM " + table, function (queryErr, queryResults, queryFields) { saveDicInsert(dic, table, queryErr); });
	}

	function saveDicInsert(dic, table, queryErr) {
		var sql;

		if (queryErr) throw queryErr;

		sql = "INSERT INTO " + table + " (word, freq) VALUES ";

		/*for (var word in dics[dic]) {
		if (dics[dic].hasOwnProperty(word)) sql += "\n('" + word + "', " + dics[dic][word] + "), ";
		}*/
		Object.keys(dics[dic]).forEach(function (word) {
			sql += "\n('" + word + "', " + dics[dic][word] + "), ";
		});

		// Cut ", "
		sql = sql.substring(0, sql.length - 2);
		db.query(sql, function (queryErr, queryResults, queryFields) { saveDicDone(dic, table, queryErr); });
	}

	function saveDicDone(dic, table, queryErr) {
		if (queryErr) throw queryErr;
		console.log("Updated dictionary " + dic + " to table " + table + ".");
	}


	// Load dictionary from database

	function loadDic(dic, table) {
		db.query("SELECT * FROM " + table, function (queryErr, queryResults, queryFields) { loadDicDone(dic, queryErr, queryResults); });
	}

	function loadDicDone(dic, queryErr, queryResults) {
		var newDic = {};

		for (var i = 0, len = queryResults.length; i < len; i++) {
			newDic[queryResults[i].word] = queryResults[i].freq;
		}

		dics[dic] = newDic;
	}


	// Join words together to try in dictionary (allows for accidental spaces or dashes).

	exports.join = function (words, joinedWords, posStart, combStart) {
		// These internal so no falsy risk
		posStart = posStart || 0;
		joinedWords = joinedWords || [];
		combStart = combStart || [];

		var count = words.length;
		var comb = combStart;
		var pos;
		var word;

		for (var len = count - posStart; len > 0; len--) {
			pos = posStart;
			word = words.slice(pos, pos + len).join("");

			if (len == 1 || exports.check(word)) {
				if (pos + len <= count) {
					comb.push(word);
					if (pos + len < count) joinedWords = exports.join(words, joinedWords, pos + len, comb);
				}

				if (pos + len == count) joinedWords.push(comb);
			}
			comb = combStart;
		}
		return joinedWords;
	};


	// Split compound words for spell check

	exports.split = function (word) {
		return splitRec(word.split(), []);
	};

	function splitRec(letters, newWords, posStart, len, combStart) {
		var count = letters.length;
		var unknown = 0;
		var pos;
		var word;
		var comb;

		// These internal so no falsy risk
		posStart = posStart || 0;
		len = len || count - posStart;
		combStart = combStart || [];

		comb = combStart;

		for ( ; len > 0; len--) {
			pos = posStart;
			word = letters.slice(pos, pos + len).join("");

			if (pos + len <= count) {
				comb.push(word);
				if (pos + len < count) newWords = splitRec(letters, newWords, pos + len, len, comb);
			}

			if (pos + len == count) {
				for (var w = 0, combLen = comb.length; w < combLen; w++) {
					if (comb[w].length > 1 && exports.check(comb[w])) {
						unknown = 0;
					} else {
						unknown++;
					}
					if (unknown == 2) break;
				}

				if (unknown < 2) newWords.push(comb);
			}
			comb = combStart;
		}
		return newWords;
	}


	// Join previously split (alternate) words together to try in dictionary.

	exports.joinAlts = function (splitWordsSets) {
		return joinAltsRec(splitWordsSets, []);
	};


	function joinAltsRec(splitWordsSets, splitWordsList, setIdx, curSplitWords) {
		setIdx = setIdx || 0;
		curSplitWords = curSplitWords || [];

		var newSplitWords;

		for (var i = 0, len = splitWordsSets[setIdx].length; i < len; i++) {
			newSplitWords = curSplitWords.concat(splitWordsSets[setIdx][i]);

			if (setIdx == splitWordsSets.length - 1) {
				splitWordsList.push(newSplitWords);
			} else {
				splitWordsList = joinAltsRec(splitWordsSets, splitWordsList, setIdx + 1, newSplitWords);
			}
		}
		return splitWordsList;
	}

	return exports;
}

module.exports = spell;