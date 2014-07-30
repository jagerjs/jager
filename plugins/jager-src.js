
'use strict';

var path = require('path');
var globule = require('globule');
var async = require('async');
var fs = require('fs');

var __root = process.cwd();

function getInfo(filename, cb) {
	var file = { filename: path.join(__root, filename) };

	fs.stat(filename, function(err, stat) {
		if (err) {
			cb(err);
		} else {
			file.stat = stat;

			fs.readFile(filename, function(err, contents) {
				if (err) {
					cb(err);
				} else {
					file.contents = contents;
					cb(null, file);
				}
			});
		}
	});
}

module.exports = function(input, options) {
	options = options || {};

	return function src(files, cb) {
		var filenames = globule.find(Array.isArray(input) ? input : [input]);

		this.jagerSrc = (this.jagerSrc || []).concat([input]);

		if (options.dependencies) {
			this.jagerSrcDependencies = (this.jagerSrcDependencies || []).concat([options.dependencies]);
		}

		async.map(filenames, getInfo, function(err, newFiles) {
			cb(err, files.concat(newFiles));
		});
	};
};
