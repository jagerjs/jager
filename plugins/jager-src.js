
'use strict';

var globule = require('globule');
var async = require('async');
var jager = require('./../jager');

function srcMapper(filename, cb) {
	jager.File.create(filename, function(err, file) {
		if (err) {
			if (err.code === 'EISDIR') {
				cb(null, null);
			} else {
				cb(err);
			}
		} else {
			cb(null, file);
		}
	});
}

module.exports = function(input, rawOptions) {
	var options = rawOptions || {};

	return function src(files, cb) {
		var filenames = globule.find(Array.isArray(input) ? input : [input]);

		this.addSource(input);

		if (options.dependencies) {
			this.addDependency(options.dependencies);
		}

		function asyncMapCallback(err, newFiles) {
			var filteredFiles;

			if (err) {
				cb(err);
			} else {
				// TODO filter out directories in globule call
				filteredFiles = newFiles.filter(function(file) {
					return file !== null;
				});

				cb(null, files.concat(filteredFiles));
			}
		}

		async.map(filenames, srcMapper, asyncMapCallback);
	};
};
