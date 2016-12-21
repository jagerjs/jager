
'use strict';

var rollup = require('rollup');

var babel = require('rollup-plugin-babel');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

var modifyBabelPreset = require('modify-babel-preset');
var babelPresetEs2015 = modifyBabelPreset('es2015', {
	// remove commonjs transform
	'transform-es2015-modules-commonjs': false,
});
var babelPresetReact = require('babel-preset-react');
var babelPresetStage0 = require('babel-preset-stage-0');
var babelPluginExternalHelpers = require('babel-plugin-external-helpers');

var gatedMap = require('./../gated-map');

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
				plugins: [
					babelPluginExternalHelpers,
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
		_bundleCache[file.filename()] = bundle;

		var result = bundle.generate({
			format: 'umd',
		});

		bundle.modules.forEach(function(module) {
			if (!/\0/.test(module.id)) {
				context.addDependency(module.id);
			}
		});

		file.contents(result.code);

		cb(null, file);
	}, function(err) {
		cb(err);
	});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return gatedMap({ glob: '**/*.js' }, rollupFile.bind(null, options));
};
