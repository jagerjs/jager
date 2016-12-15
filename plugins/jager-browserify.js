
/**
 * Process a file with browserify
 *
 * Browserify lets you `require('modules')` in the browser by bundling up all of your dependencies. When watch mode is active `watchify` is used to produces faster builds.
 *
 * **API**: `('browserify'[, options])`
 *
 * - `options`:
 * 	- See the [browserify options] for details
 * 	- Extra options:
 * 		- `babel`: When set the babel transform is used, see [babel options] for more options, when `true` is supplied the `es2015` and `react` preset are used.
 * 		- `sourceMap`: These options are in line with the options used in the [less options] (currently only `sourceMapBasepath` is supported)
 *
 * [browserify options]: https://github.com/substack/node-browserify#var-b--browserifyfiles-or-opts
 * [babel options]: http://babeljs.io/docs/usage/options/
 * [less options]: http://lesscss.org/usage/#programmatic-usage
 */

'use strict';

var path = require('path');

var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
var mold = require('mold-source-map');
var extend = require('util')._extend;

var babelPresetEs2015 = require('babel-preset-es2015');
var babelPresetReact = require('babel-preset-react');
var babelPresetStage0 = require('babel-preset-stage-0');

var gatedMap = require('./../lib/gated-map');

var __root = process.cwd();

var _instanceCache = {};

function getBabelTransform(options) {
	var babelOptions = {
		presets: [babelPresetEs2015, babelPresetReact, babelPresetStage0],
	};

	if (typeof options === 'object') {
		extend(babelOptions, options);
	}

	return babelify.configure(babelOptions);
}

function createBrowserifyInstance(context, options, file) {
	var browserifyOptions = {
		debug: !!options.sourceMap,
	};
	var b;

	if (context.isWatching()) {
		// used by watchify
		extend(browserifyOptions, {
			cache: {},
			packageCache: {},
		});
	}

	extend(browserifyOptions, options);

	b = browserify(browserifyOptions);

	if (options.babel) {
		b.transform(getBabelTransform(options.babel));
	}

	return b.require(file.filename(), { entry: true });
}

function getBrowserifyInstance(context, options, file) {
	if (!_instanceCache[file.filename()]) {
		_instanceCache[file.filename()] = createBrowserifyInstance(context, options, file);
		_instanceCache[file.filename()].on('file', function(file) {
			context.addDependency(file);
		});

		if (context.isWatching()) {
			_instanceCache[file.filename()] = watchify(_instanceCache[file.filename()]);
		} else {
			_instanceCache[file.filename()] = _instanceCache[file.filename()];
		}
	}

	return _instanceCache[file.filename()];
}

function processBrowserify(options, context, file, cb) {
	var b = getBrowserifyInstance(context, options, file);
	var stream = b.bundle();
	var bufferList = [];
	var errorEmitted = false;

	stream.on('data',
		function(part) {
			if (part instanceof Buffer) {
				bufferList.push(part);
			} else {
				bufferList.push(new Buffer(part));
			}
		})
		.on('error', function(err) {
			errorEmitted = true;

			if (err.codeFrame) {
				err.message += '\n' + err.codeFrame;
			}

			cb(err);
		})
		.on('end', function() {
			if (!errorEmitted) {
				file.buffer(Buffer.concat(bufferList));
				cb(null, file);
			}
		});

	// we need to do this after the event handlers, .pipe returns a stream without them
	if (options.sourceMap) {
		stream.pipe(mold.transformSources(function(file) {
			var base;

			if (options.sourceMap && options.sourceMap.sourceMapBasepath) {
				base = path.join(__root, options.sourceMap.sourceMapBasepath);
			} else {
				base = __root;
			}

			return path.relative(base, file);
		}));
	}
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return gatedMap({ glob: '**/*.js' }, processBrowserify.bind(null, options));
};
