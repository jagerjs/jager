
/**
 *
 * Write files
 *
 * Write files in the chain to a given destination. By default only files with a newer `mtime` are written.
 *
 * **API**: `('dest', dir[, options])`
 *
 * - `dir`: the directory to which the files in the chain are written, if the directory does not exist, it's created
 * - `options`:
 * 	- `checkContents`: Check for the contents of the new file location, if the contents is the same, the file is not written (default: `false`)
 */

'use strict';

var path = require('path');
var fs = require('fs');

var mkdirp = require('mkdirp');
var async = require('async');

var newer = require('./jager-newer');

function writeFile(pathname, file, cb) {
	fs.writeFile(pathname, file.buffer(), function(err) {
		if (err) {
			cb(err);
		} else {
			file.rename(pathname);
			cb(null, file);
		}
	});
}

function write(pathname, file, cb) {
	mkdirp(path.dirname(pathname), function(err) {
		if (err) {
			cb(err);
		} else {
			writeFile(pathname, file, cb);
		}
	});
}

module.exports = function(target, options) {
	var newerInstance = newer(target, options);

	return function dest(files, cb) {
		async.map(files, function(file, cb) {
			newerInstance.single(file, function(err, result) {
				if (err) {
					cb(err);
				} else if (result.newer) {
					file.rename(result.to);
					file.stat(result.stat);

					cb(null, file);
				} else {
					write(result.to, file, function(err) {
						if (err) {
							cb(err);
						} else {
							file.rename(result.to);
							cb(null, file);
						}
					});
				}
			});
		}, cb);
	};
};
