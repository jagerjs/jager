
'use strict';

var autoprefixer = require('autoprefixer');
var async = require('async');

module.exports = function(browserVersions) {
	function prefix(file, cb) {
		file.contents = new Buffer(autoprefixer(browserVersions).process(file.contents.toString('utf8')).css);
		cb(null, file);
	}

	return function autoprefixer(files, cb) {
		async.map(files, prefix, cb);
	};
};
