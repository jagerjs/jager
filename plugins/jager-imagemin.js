
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
			imageminGifsicle(options.gif),
			imageminJpegtran(options.jpeg),
			imageminOptipng(options.png),
			imageminSvgo(options.svg),
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

module.exports = function(options) {
	options = options || {};

	return function(files, cb) {
		async.map(files, process.bind(null, options), cb);
	};
};
