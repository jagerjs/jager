
/**
 * Combine source files
 *
 * Combine all files in the chain into a new file
 *
 * **API**: `('concat', filename)`
 *
 * - `filename`: The filename for the new file
 */

'use strict';

var path = require('path');

var jager = require('./../jager');

var __root = process.cwd();

module.exports = function(filename) {
	if (!filename) {
		throw new Error('Name is required for jager-concat');
	}

	return function concat(files, cb) {
		var file = new jager.File(
			path.join(__root, filename),
			files.map(function(file) { return file.contents(); }).join('\n')
			);

		cb(null, [file]);
	};
};
