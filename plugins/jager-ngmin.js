
'use strict';

var ngmin = require('ngmin');
var async = require('async');

module.exports = function(browserVersions) {
	function processNgmin(file, cb) {
		file.contents = new Buffer(ngmin.annotate(file.contents.toString('utf8')));
		cb(null, file);
	}

	return function ngmin(files, cb) {
		async.map(files, processNgmin, cb);
	};
};
