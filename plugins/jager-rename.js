
/**
 * Rename a file
 *
 * Rename the first file in the chain, if it doesn't exist, an empty file is added to the chain
 *
 * **API**: `('rename', filename)`
 *
 * - `filename`: the new filename. The following replacements will be done in the filename:
 *     - `[timestamp]`: the current timestamp is included
 *     - `[hash]`: the md5 checksum of the contents is included
 */

'use strict';

var path = require('path');
var crypto = require('crypto');

var each = require('lodash/each');
var async = require('async');

var jager = require('./../jager');

var __root = process.cwd();

var REPLACERS_DETECT = /\[[a-z]+\]/;

var replacers = {
	basename: function(file) {
		var filename = file.filename();
		return path.basename(filename, path.extname(filename));
	},
	extension: function(file) {
		return path.extname(file.filename());
	},
	timestamp: function() {
		return Date.now();
	},
	hash: function(file) {
		return crypto.createHash('md5').update(file.contents()).digest('hex');
	},
};

function formatFilename(filename, file) {
	var formattedFilename = filename;

	each(replacers, function(replacer, key) {
		formattedFilename = formattedFilename.replace('[' + key + ']', replacer.bind(null, file));
	});

	return formattedFilename;
}

function renameFile(filename, file, cb) {
	file.rename(path.join(__root, formatFilename(filename, file)));
	cb(null, file);
}

module.exports = function(filename) {
	var hasReplacers = REPLACERS_DETECT.test(filename);

	return function rename(files, cb) {
		var filesToBeRenamed = files;

		if (files.length === 0) {
			if (hasReplacers) {
				throw new Error('No source found for replacers');
			}

			filesToBeRenamed = [new jager.File('foo.bar', new Buffer(''))];
		} else if (files.length > 1 && !hasReplacers) {
			throw new Error('More than one file is unsupported');
		}

		async.map(filesToBeRenamed, renameFile.bind(null, filename), cb);
	};
};
