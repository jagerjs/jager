
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

var jager = require('./../jager');

var __root = process.cwd();

var replacers = {
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

module.exports = function(filename) {
	return function rename(files, cb) {
		var file;

		if (files.length === 1) {
			file = files[0];
		} else if (files.length === 0) {
			file = new jager.File(path.join(__root, filename), new Buffer(''));
		} else {
			throw new Error('More than one file is unsupported');
		}

		file.rename(path.join(__root, formatFilename(filename, file)));

		cb(null, [file]);
	};
};
