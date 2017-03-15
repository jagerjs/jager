
'use strict';

var rollup = require('rollup');

var babel = require('rollup-plugin-babel');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

var babelPresetEs2015 = require('babel-preset-es2015-rollup');
var babelPresetReact = require('babel-preset-react');
var babelPresetStage0 = require('babel-preset-stage-0');

var gatedMap = require('./../lib/gated-map');

var _bundleCache = {};

function rollupFile(options, context, file, cb) {
	rollup.rollup({
		entry: file.filename(),
		cache: _bundleCache[file.filename()] || null,
		plugins: [
			babel({
				babelrc: false,
				presets: [
					babelPresetEs2015,
					babelPresetReact,
					babelPresetStage0,
				],
			}),
			nodeResolve({
				jsnext: true,
				main: true,
			}),
			commonjs({
				include: 'node_modules/**',
			}),
		],
	}).then(function(bundle) {
		var sourceMap = options.sourceMap !== false;
		var bundleOptions = {
			format: 'umd',
		};
		var content;

		if (sourceMap) {
			bundleOptions.sourceMap = true;
		}

		_bundleCache[file.filename()] = bundle;

		var result = bundle.generate(bundleOptions);

		bundle.modules.forEach(function(module) {
			if (!/\0/.test(module.id)) {
				context.addDependency(module.id);
			}
		});

		content = result.code;

		if (sourceMap) {
			content += '\n//# sourceMappingURL=' + result.map.toUrl() + '\n';
		}

		file.contents(content);

		cb(null, file);
	}, function(err) {
		cb(err);
	});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return gatedMap({ glob: '**/*.js' }, rollupFile.bind(null, options));
};
