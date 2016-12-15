
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

var gatedMap = require('./../lib/gated-map');

function minifyImage(options, context, file, cb) {
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

	return gatedMap({ glob: '**/*.+(png|jpg|jpeg|gif|svg)' }, minifyImage.bind(null, options));
};
