
'use strict';

var autoprefixer = require('autoprefixer');
var async = require('async');

module.exports = function(browserVersions) {
	function prefix(file, cb) {
		file.contents(autoprefixer.process(file.contents(), browserVersions).css);
		cb(null, file);
	}

	return function autoprefixer(files, cb) {
		async.map(files, prefix, cb);
	};
};
