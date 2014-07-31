
'use strict';

var ngmin = require('ngmin');
var async = require('async');

module.exports = function(browserVersions) {
	function processNgmin(file, cb) {
		file.contents(ngmin.annotate(file.contents()));
		cb(null, file);
	}

	return function ngmin(files, cb) {
		async.map(files, processNgmin, cb);
	};
};
