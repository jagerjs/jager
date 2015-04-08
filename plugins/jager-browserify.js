
'use strict';

var path = require('path');

var async = require('async');
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var mold = require('mold-source-map');
var extend = require('util')._extend;

var __root = process.cwd();

var _instanceCache = {};

function getBabelTransform(options) {
	var babelOptions = {
		blacklist: ['useStrict'],
	};

	if (typeof options === 'object') {
		extend(babelOptions, options);
	}

	return babelify.configure(babelOptions);
}

function createBrowserifyInstance(options, file) {
	var browserifyOptions = {
		debug: !!options.sourceMap,
	};
	var b;

	if (options.watch) {
		// used by watchify
		extend(browserifyOptions, {
			cache: {},
			packageCache: {},
			fullPaths: true,
		});
	}

	extend(browserifyOptions, options);

	b = browserify(browserifyOptions);

	if (options.babel) {
		b.transform(getBabelTransform(options.babel));
	}

	return b.require(file.filename(), { entry: true });
}

function getBrowserifyInstance(options, addDependency, file) {
	if (!_instanceCache[file.filename()]) {
		_instanceCache[file.filename()] = createBrowserifyInstance(options, file);
		_instanceCache[file.filename()].on('file', addDependency);

		if (options.watch) {
			_instanceCache[file.filename()] = watchify(_instanceCache[file.filename()]);
		} else {
			_instanceCache[file.filename()] = _instanceCache[file.filename()];
		}
	}

	return _instanceCache[file.filename()];
}

function processBrowserify(options, addDependency, file, cb) {
	var b = getBrowserifyInstance(options, addDependency, file);
	var stream = _instanceCache[file.filename()].bundle();
	var bufferList = [];

	if (options.sourceMap) {
		stream = stream.pipe(mold.transformSources(function(file) {
			var base;

			if (options.sourceMap && options.sourceMap.sourceMapBasepath) {
				base = path.join(__root, options.sourceMap.sourceMapBasepath);
			} else {
				base = __root;
			}

			return path.relative(base, file);
		}));
	}

	return stream
		.on('data', function(part) {
			bufferList.push(part);
		}).
		on('error', function(err) {
			cb(err);
		})
		.on('end', function() {
			file.buffer(Buffer.concat(bufferList));
			cb(null, file);
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
