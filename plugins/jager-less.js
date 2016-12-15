
/**
 * Process less files
 *
 * Process less file into css files
 *
 * **API**: `('less'[, options])`
 *
 * - `options`: See [less options] for all the available options
 *
 * [less options]: http://lesscss.org/usage/#programmatic-usage
 */

'use strict';

var path = require('path');
var extend = require('util')._extend;

var less = require('less');

var gatedMap = require('./../lib/gated-map');

var __root = process.cwd();

function compileLess(options, context, file, cb) {
	var basePath = options.basePath || __root;

	var lessOptions = {
		paths: [basePath],
		filename: path.relative(__root, file.filename()),
	};

	extend(lessOptions, options);

	if (options.sourceMap === 'inline') {
		lessOptions.sourceMap = {
			sourceMapFileInline: true,
			outputSourceFiles: true,
		};
	}

	less.render(file.contents(), lessOptions)
		.then(function(output) {
			context.addDependency(output.imports);
			file.contents(output.css);
			cb(null, file);
		},
		function(err) {
			cb(err);
		});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return gatedMap({ glob: '**/*.less' }, compileLess.bind(null, options));
};
