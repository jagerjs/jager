
/* eslint-disable no-spaced-func */
var path = require('path');

var jager = require('./../jager');

module.exports = function javascript(rawOptions) {
	var options = typeof rawOptions === 'string'
		? { entry: rawOptions }
		: (rawOptions || {});

	if (!options.entry) {
		throw new Error('No input file given');
	}

	var extension = path.extname(options.entry);
	var basename = path.basename(options.entry, extension);
	var newFilename = basename + '-[hash].js';

	var javascript = jager.create()
		('src', options.entry)
		('browserify', {
			basedir: path.dirname(options.entry),
			babel: true,
			sourceMap: true,
		})
		('rename', newFilename)
		('dest', path.dirname(options.entry));

	jager.task('javascript', javascript);
	jager.task('javascript:watch', { watch: true }, javascript);

	return javascript;
};
