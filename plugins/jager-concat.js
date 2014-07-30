
'use strict';

var path = require('path');

var __root = process.cwd();

module.exports = function(filename) {
	if (!filename) {
		throw new Error('Name is required for jager-concat');
	}

	return function concat(files, cb) {
		cb(null, [{
			filename: path.join(__root, filename),
			contents: Buffer.concat(files.map(function(file) { return file.contents; }))
			}]);
	};
};
