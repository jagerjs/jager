
'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var fs = require('fs');

function write(pathname, file, filename, cb) {
	mkdirp(path.dirname(pathname), function(err) {
		if (err) {
			return cb(err);
		}

		fs.writeFile(pathname, file.buffer(), function(err, rs) {
			if (err) {
				cb(err);
			} else {
				file.rename(filename);
				cb(null, file);
			}
		});
	});
}

module.exports = function(target, options) {
	var basePath = options && options.basePath;

	return function dest(files, cb) {
		function desti(file, cb) {
			var from = file.filename();
			var to;

			if (basePath && from.indexOf(basePath) === 0) {
				to = path.join(target, from.substring(basePath.length));
			} else {
				to = path.join(target, path.basename(from));
			}

			// we don't need error reporting for the stat/readfile,
			// if it fails we just overwrite. only reason not to would be performance
			fs.stat(to, function(err, stat) {
				if (stat) {
					fs.readFile(to, 'utf8', function(err, contents) {
						if (contents === file.contents()) {
							file.rename(to);
							file.stat(stat);
							cb(null, file);
						} else {
							write(to, file, to, cb);
						}
					});
				} else {
					write(to, file, to, cb);
				}
			});
		}

		async.map(files, desti, cb);
	};
};
