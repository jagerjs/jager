
/**
 * Minify images seamlessly
 *
 * Minifies all images (based on extension) in the chain with [imagemin].
 *
 * **API**: `('imagemin'[, options])`
 *
 * - `options`:
 * 	- `gifsicle`: See [gifsicle options] for more information
 * 	- `jpegtran`: See [jpegtran options] for more information
 * 	- `optipng`: See [optipng options] for more information
 * 	- `svgo`: See [svgo options] for more information
 *
 * [imagemin]: https://github.com/imagemin/imagemin
 * [gifsicle options]: https://github.com/imagemin/imagemin-gifsicle
 * [jpegtran options]: https://github.com/imagemin/imagemin-jpegtran
 * [optipng options]: https://github.com/imagemin/imagemin-optipng
 * [svgo options]: https://github.com/imagemin/imagemin-svgo
 */

'use strict';

var imagemin = require('imagemin');
var imageminGifsicle = require('imagemin-gifsicle');
var imageminJpegtran = require('imagemin-jpegtran');
var imageminOptipng = require('imagemin-optipng');
var imageminSvgo = require('imagemin-svgo');

var minimatch = require('minimatch');
var async = require('async');

var pattern = new minimatch.Minimatch('**/*.+(png|jpg|jpeg|gif|svg)');

function process(options, file, cb) {
	if (pattern.match(file.filename())) {
		minifyImage(options, file, cb);
	} else {
		cb(null, file);
	}
}

function minifyImage(options, file, cb) {
	var imageminOptions = {
		use: [
			imageminGifsicle(options.gifsicle),
			imageminJpegtran(options.jpegtran),
			imageminOptipng(options.optipng),
			imageminSvgo(options.svgo),
		],
	};

	imagemin.buffer(file.buffer(), imageminOptions)
		.then(function(data) {
			file.buffer(data);
			cb(null, file);
		})
		.catch(function(err) {
			cb(err);
		});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return function(files, cb) {
		async.map(files, process.bind(null, options), cb);
	};
};
