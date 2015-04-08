
'use strict';

var path = require('path');

var jager = require('./../jager');

var __root = process.cwd();

module.exports = function(filename) {
	if (!filename) {
		throw new Error('Name is required for jager-concat');
	}

	return function concat(files, cb) {
		var file = new jager.File(
			path.join(__root, filename),
			Buffer.concat(files.map(function(file) { return file.buffer(); }))
			);

		cb(null, [file]);
	};
};
