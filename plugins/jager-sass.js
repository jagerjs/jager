
/**
 * Process sass/scss files
 *
 * Process sass/scss file into css files
 *
 * **API**: `('sass'[, options])`
 *
 * - `options`: See [sass options] for all the available options
 *
 * [sass options]: https://github.com/sass/node-sass#options
 */

'use strict';

var path = require('path');
var extend = require('util')._extend;

var sass = require('node-sass');

var gatedMap = require('./../lib/gated-map');

var __root = process.cwd();

function compileSass(context, options, file, cb) {
	var basePath = options.basePath || __root;

	var sassOptions = {
		includePaths: [basePath],
		filename: path.relative(__root, file.filename()),
		indentedSyntax: true,
	};

	extend(sassOptions, options);

	sass.render({
		file: file.filename(),
		// data: file.contents(),
	}, function(err, result) {
		if (err) {
			cb(err);
		} else {
			context.addDependency(result.stats.includedFiles);
			file.buffer(result.css);
			cb(null, file);
		}
	});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return function sass(files, cb) {
		gatedMap('**/{*.scss,*.sass}', files, compileSass.bind(null, this, options), cb);
	};
};
