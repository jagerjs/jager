
/**
 * Create on the fly modernizr builds
 *
 * **API**: `('modernizr'[, options])`
 *
 * - `options`: see the [modernizr options] for all available options
 *
 * [modernizr options]: https://github.com/Modernizr/Modernizr/blob/master/lib/config-all.json
 */

'use strict';

var modernizr = require('modernizr');

var jager = require('../jager');

function generateBuild(options, cb) {
	modernizr.build(options, function(result) {
		var file = new jager.File('modernizr.js', new Buffer(result));

		cb(file);
	});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return function modernizr(files, cb) {
		generateBuild(options, function(file) {
			files.push(file);
			cb(null, files);
		});
	};
};
