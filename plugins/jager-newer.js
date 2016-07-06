
/**
 * Filter old files out of the chain
 *
 * **API**: `('newer', target[, options])`
 *
 * - `target`: The target to which you want to compare the files in the chain
 * - `options`:
 * 	- `basePath`: Common base path between target and source files (default: `cwd`)
 * 	- `checkContents`: Check for the contents of the new file location, if the contents is the same, the file is filteredwritten (default: `false`)
 */

'use strict';

var path = require('path');
var fs = require('fs');

var async = require('async');

function single(target, basePath, checkContents, file, cb) {
	var from = file.filename();
	var to;

	if (basePath && from.indexOf(basePath) === 0) {
		to = path.join(target, from.substring(basePath.length));
	} else {
		to = path.join(target, path.basename(from));
	}

	// true: a newer version already exists, no action needed
	// false: our input is newer that the desired output, action needed
	function report(result, stat) {
		cb(null, {
			newer: result,
			to: to,
			file: file,
			stat: stat,
		});
	}

	fs.stat(to, function(err, stat) { // eslint-disable-line handle-callback-err
		if (stat) {
			if (checkContents) {
				fs.readFile(to, function(err, contents) {
					if (err || !file.buffer().equals(contents)) {
						report(false);
					} else {
						report(true, stat);
					}
				});
			} else if (stat.mtime > file.stat().mtime) {
				report(true, stat);
			} else {
				report(false);
			}
		} else {
			report(false);
		}
	});
}

module.exports = function(target, options) {
	var basePath = options && options.basePath;
	var checkContents = options && options.checkContents;

	var multiple = function(files, cb) {
		async.map(files, multiple.single, function(err, newFiles) {
			if (err) {
				cb(err);
			} else {
				cb(null, newFiles.filter(function(item) {
					return !item.newer;
				}).map(function(item) {
					return item.file;
				}));
			}
		});
	};

	multiple.single = single.bind(null, target, basePath, checkContents);

	return multiple;
};
