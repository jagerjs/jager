
'use strict';

var path = require('path');

var jager = require('./../jager');

var __root = process.cwd();

module.exports = function(filename) {
	return function rename(files, cb) {
		var file;

		if (files.length) {
			files[0].rename(path.join(__root, filename));

			cb(null, files);
		} else {
			cb(null, [new jager.File(path.join(__root, filename), new Buffer(''))]);
		}
	};
};
