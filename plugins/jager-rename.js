
'use strict';

var path = require('path');

var __root = process.cwd();

module.exports = function(filename) {
	return function rename(files, cb) {
		if (files.length) {
			files[0].filename = path.join(__root, filename);
			cb(null, files);
		} else {
			cb(null, {
				filename: path.join(__root, filename),
				contents: new Buffer('')
			});
		}
	};
};
