
'use strict';

var modernizr = require('modernizr');

var jager = require('../jager');

function generateBuild(options, cb) {
	modernizr.build(options, function(result) {
		var file = new jager.File('modernizr.js', new Buffer(result));

		cb(file);
	});
}

module.exports = function(options) {
	options = options || {};

	return function modernizr(files, cb) {
		generateBuild(options, function(file) {
			files.push(file);
			cb(null, files);
		});
	};
};
