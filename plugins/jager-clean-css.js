
/**
 * Library for minifying CSS files
 *
 * Clean-css is a fast and efficient Node.js library for minifying CSS files. According to [tests] it is one of the best available.
 *
 * **API**: `('clean-css'[, options])`
 *
 * - `options`: see the [clean-css options] for all available options
 *
 * [tests]: http://goalsmashers.github.io/css-minification-benchmark/
 * [clean-css options]: https://github.com/jakubpawlowicz/clean-css
 */

'use strict';

var CleanCSS = require('clean-css');

var gatedMap = require('./../lib/gated-map');

function processCss(options, context, file, cb) {
	new CleanCSS(options).minify(file.contents(), function(err, minified) {
		if (err) {
			cb(err);
		} else {
			file.contents(minified.styles);
			cb(null, file);
		}
	});
}

module.exports = function(options) {
	return gatedMap({ glob: '**/*.css', production: true }, processCss.bind(null, options));
};
