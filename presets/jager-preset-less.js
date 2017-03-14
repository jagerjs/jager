
/* eslint-disable no-spaced-func */
var path = require('path');

var jager = require('./../jager');

module.exports = function less(rawOptions) {
	var options = typeof rawOptions === 'string'
		? { entry: rawOptions }
		: (rawOptions || {});

	if (!options.entry) {
		throw new Error('No input file given');
	}

	var extension = path.extname(options.entry);
	var basename = path.basename(options.entry, extension);
	var newFilename = basename + '-[hash].css';

	var less = jager.create()
		('src', options.entry, { dependencies: '**/*.less' })
		('less')
		('autoprefixer')
		('rename', newFilename)
		('dest', path.dirname(options.entry));

	jager.task('less', less);
	jager.task('less:watch', { watch: true }, less);
};
