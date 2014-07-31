
'use strict';

var globule = require('globule');
var async = require('async');
var jager = require('../jager');

var __root = process.cwd();

module.exports = function(input, options) {
	options = options || {};

	return function src(files, cb) {
		var filenames = globule.find(Array.isArray(input) ? input : [input]);

		this.jagerSrc = (this.jagerSrc || []).concat([input]);

		if (options.dependencies) {
			this.jagerSrcDependencies = (this.jagerSrcDependencies || []).concat([options.dependencies]);
		}

		async.map(filenames, jager.File.create, function(err, newFiles) {
			cb(err, files.concat(newFiles));
		});
	};
};
