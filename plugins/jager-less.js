
'use strict';

var async = require('async');
var less = require('less');
var extend = require('util')._extend;

var __root = process.cwd();

function compileLess(options, file, cb) {
	var pluginMandatoryOptions = {
		paths: [__root],
		filename: file.filename(),
	};

	extend(options, pluginMandatoryOptions);

	if (options.sourceMap === 'inline') {
		options.sourceMap = { sourceMapFileInline: true };
	}

	less.render(file.contents(), options)
		.then(function(output) {
			file.contents(output.css);
			cb(null, file);
		},
		function(err) {
			cb(err);
		});
}

module.exports = function(options) {
	options = options || {};

	return function less(files, cb) {
		async.map(files, compileLess.bind(null, options), cb);
	};
};
