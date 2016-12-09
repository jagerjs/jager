
/**
 * Filter files based on filename
 *
 * Filter files based on their filename with a glob
 *
 * **API**: `('filter', glob)`
 *
 * - `glob': glob of files you want to match
 */

'use strict';

var minimatch = require('minimatch');

module.exports = function(glob) {
	return function(files, cb) {
		var fileList = [];

		var filteredFiles = files.filter(function(file) {
			if (fileList.indexOf(file.filename()) !== -1) {
				return false;
			}

			fileList.push(file.filename());
			return minimatch(file.filename(), glob);
		});

		cb(null, filteredFiles);
	};
};
