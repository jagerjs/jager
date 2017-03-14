
/**
 * Rename a file
 *
 * Rename the first file in the chain, if it doesn't exist, an empty file is added to the chain
 *
 * **API**: `('rename', filename)`
 *
 * - `filename`: the new filename. The following replacements will be done in the filename:
 *     - `[filename]`: the filename
 *     - `[basename]`: the filename without extension
 *     - `[extension]`: the extension
 *     - `[timestamp]`: the current timestamp is included
 *     - `[hash]`: the md5 checksum of the contents is included
 */

'use strict';

var path = require('path');
var crypto = require('crypto');

var each = require('lodash/each');
var async = require('async');

var __root = process.cwd();

var REPLACERS_DETECT = /\[[a-z]+\]/;

var replacers = {
	dirname: function(context, file) {
		return path.dirname(file.filename()).replace(__root, '');
	},
	filename: function(context, file) {
		return path.basename(file.filename());
	},
	basename: function(context, file) {
		var filename = file.filename();
		return path.basename(filename, path.extname(filename));
	},
	extension: function(context, file) {
		return path.extname(file.filename());
	},
	timestamp: function(context) {
		if (context.isProduction()) {
			return Date.now();
		}

		return 123456789;
	},
	hash: function(context, file) {
		if (context.isProduction()) {
			return crypto.createHash('md5').update(file.buffer()).digest('hex');
		}

		return 'deadbeef';
	},
};

function formatFilename(context, filename, file) {
	var formattedFilename = filename;

	each(replacers, function(replacer, key) {
		formattedFilename = formattedFilename.replace('[' + key + ']', replacer.bind(null, context, file));
	});

	return formattedFilename;
}

function renameFile(context, filename, file, cb) {
	file.rename(path.join(__root, formatFilename(context, filename, file)));
	cb(null, file);
}

module.exports = function(filename) {
	var hasReplacers = REPLACERS_DETECT.test(filename);

	return function rename(files, cb) {
		var filesToBeRenamed = files;
		var context = this;

		if (files.length > 1 && !hasReplacers) {
			throw new Error('More than one file is unsupported');
		}

		async.map(filesToBeRenamed, renameFile.bind(null, context, filename), cb);
	};
};
