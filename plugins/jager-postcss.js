
'use strict';

var postcss = require('postcss');
var async = require('async');

function process(options, file, cb) {
	var result = postcss(options.plugins || []).process(file.contents());

	result.then(function(processor) {
		file.contents(processor.toString());
		cb(null, file);
	}).catch(function(err) {
		cb(err);
	});
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return function(files, cb) {
		async.map(files, process.bind(null, options), cb);
	};
};
