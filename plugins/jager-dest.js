
'use strict';

var path = require('path');
var mkdirp = require('mkdirp');
var async = require('async');
var fs = require('fs');

var __root = process.cwd();

module.exports = function(target) {
	return function dest(files, cb) {
		function desti(file, cb) {
			var filename = path.join(target, path.basename(file.filename()));

			fs.writeFile(path.join(__root, filename), file.buffer(), function(err, rs) {
				if (err) {
					cb(err);
				} else {
					file.rename(filename);
					cb(null, file);
				}
			});
		}

		mkdirp(path.join(__root, target), function() {
			async.map(files, desti, cb);
		});
	};
};
