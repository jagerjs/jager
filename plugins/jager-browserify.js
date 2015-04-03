
'use strict';

var async = require('async');
var browserify = require('browserify');
var babelify = require('babelify');
var extend = require('util')._extend;

var __root = process.cwd();

var babelOptions = {
	blacklist: ['useStrict'],
};

function processBrowserify(options, addDependency, file, cb) {
	var debug = !!options.sourceMap;
	var b = browserify({ debug: debug });

	if (options.babel) {
		b.transform(babelify.configure(babelOptions));
	}

	b.require(file.filename(), { entry: true });

	b.on('file', addDependency);

	b.bundle(function(err, result) {
		if (err) {
			cb(err);
		} else {
			file.buffer(result);
			cb(null, file);
		}
	});
}

module.exports = function(options) {
	options = options || {};

	return function(files, cb) {
		var that = this;

		function addDependency(dependency) {
			that.jagerSrcDependencies = (that.jagerSrcDependencies || []).concat([dependency]);
		}

		async.map(files, processBrowserify.bind(null, options, addDependency), cb);
	};
};
