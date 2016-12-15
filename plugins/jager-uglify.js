
/**
 * Uglify javascript
 *
 * Compress javascript files
 *
 * **API**: `('uglify')`
 */

'use strict';

var uglifyJs = require('uglify-js');

var gatedMap = require('./../lib/gated-map');

function minify(file, cb) {
	try {
		file.contents(uglifyJs.minify(file.contents(), { fromString: true }).code);
		cb(null, file);
	} catch (e) {
		cb(e);
	}
}

module.exports = function() {
	return function uglify(files, cb) {
		gatedMap('**/*.js', files, minify, cb);
	};
};
