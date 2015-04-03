
'use strict';

var async = require('async');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var extend = require('util')._extend;

var __root = process.cwd();

var babelOptions = {
	blacklist: ['useStrict'],
};

var _instanceCache = {};

function getBrowserify(options, file) {
	var debug = !!options.sourceMap;
	var b = browserify({
		debug: debug,
		detectGlobals: false,
		insertGlobals: true,
		cache: {},
		packageCache: {},
		fullPaths: true
	});

	if (options.babel) {
		b.transform(babelify.configure(babelOptions));
	}

	b.require(file.filename(), { entry: true });

	return b;
}

var phr = require('pretty-hrtime');

function processBrowserify(options, addDependency, file, cb) {
	var b;

	var s = process.hrtime();
	if (!_instanceCache[file.filename()]) {
		b = getBrowserify(options, file);
		b.on('file', addDependency);

		if (options.watch) {
			_instanceCache[file.filename()] = watchify(b);
		} else {
			_instanceCache[file.filename()] = b;
		}
	}

	_instanceCache[file.filename()].bundle(function(err, result) {
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

		if (this.watch) {
			options.watch = true;
		}

		async.map(files, processBrowserify.bind(null, options, addDependency), cb);
	};
};
