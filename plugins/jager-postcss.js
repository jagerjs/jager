
/**
 * Transforming CSS with JS plugins
 *
 * [PostCSS] is a tool for transforming CSS with JS plugins. These plugins can support variables and mixins, transpile future CSS syntax, inline images, and more.
 *
 * **API**: `('postcss'[, options])`
 *
 * - `options`:
 *     - `plugins`: Plugins used by [PostCSS], see [PostCSS plugin options]
 *
 * [PostCSS]: https://github.com/postcss/postcss
 * [PostCSS plugin options]: https://github.com/postcss/postcss#usage
 */

'use strict';

var postcss = require('postcss');

var gatedMap = require('./../lib/gated-map');

function process(options, file, cb) {
	var result = postcss(options.plugins || []).process(file.contents());

	result.then(function(processor) {
		file.contents(processor.toString());
		cb(null, file);
	}).catch(function(err) {
		cb(err);
	});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return function(files, cb) {
		gatedMap('**/*.css', files, process.bind(null, options), cb);
	};
};
