
'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var fs = require('fs');

var __root = process.cwd();

function write(pathname, file, filename, cb) {
	fs.writeFile(pathname, file.buffer(), function(err, rs) {
		if (err) {
			cb(err);
		} else {
			file.rename(filename);
			cb(null, file);
		}
	});
}

module.exports = function(target) {
	return function dest(files, cb) {
		function desti(file, cb) {
			var filename = path.join(target, path.basename(file.filename()));
			var pathname = path.join(__root, filename);

			// we don't need error reporting for the stat/readfile,
			// if it fails we just overwrite. only reason not to would be performance
			fs.stat(pathname, function(err, stat) {
				if (stat) {
					fs.readFile(pathname, 'utf8', function(err, contents) {
						if (contents === file.contents()) {
							file.rename(filename);
							file.stat(stat);
							cb(null, file);
						} else {
							write(pathname, file, filename, cb);
						}
					});
				} else {
					write(pathname, file, filename, cb);
				}
			});
		}

		mkdirp(path.join(__root, target), function() {
			async.map(files, desti, cb);
		});
	};
};
