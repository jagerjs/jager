
'use strict';

var Imagemin = require('imagemin');
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
	new Imagemin()
		.src(file.buffer())
		.use(Imagemin.gifsicle(options.gif))
		.use(Imagemin.jpegtran(options.jpeg))
		.use(Imagemin.optipng(options.png))
		.use(Imagemin.svgo(options.svg))
		.run(function(err, files) {
			if (err) {
				cb(err);
			} else {
				file.buffer(files[0].contents);
				cb(null, file);
			}
		});
}

module.exports = function(options) {
	options = options || {};

	return function(files, cb) {
		async.map(files, process.bind(null, options), cb);
	};
};
