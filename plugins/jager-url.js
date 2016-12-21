
/**
 * Add URLs to the chain
 *
 * Notes:
 * - This is only useful if you use the `inject` plugin as well
 * - All modification on an URL will give an error
 *
 * **API**: `('url', url)`
 *
 * - `url`: the URL you want to add
 */

'use strict';

var jager = require('./../jager');

module.exports = function(url) {
	return function(files, cb) {
		files.push(jager.File.createUrl(url));
		cb(null, files);
	};
};
