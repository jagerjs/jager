
'use strict';

var async = require('async');
var uglify = require('uglify-js');

function minify(file, cb) {
	try {
		file.contents(uglify.minify(file.contents(), { fromString: true }).code);
		cb(null, file);
	} catch (e) {
		cb(e);
	}
}

module.exports = function() {
	return function uglify(files, cb) {
		async.map(files, minify, cb);
	};
};
