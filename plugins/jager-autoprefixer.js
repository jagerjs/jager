
/**
 * Add vendor prefixes to css
 *
 * Plugin to parse CSS and add vendor prefixes to CSS rules using values from [Can I Use]. It is [recommended] by Google and used in Twitter, and Taobao.
 *
 * [Can I Use]: http://caniuse.com/
 * [recommended]: https://developers.google.com/web/fundamentals/tools/build/setupbuildprocess#dont-trip-up-with-vendor-prefixes
 *
 * **API**: `('autoprefixer'[, browserVersions])`
 *
 * - `browserVersions`: [List of browser you wan to support]
 *
 * [List of browser you wan to support]: https://github.com/postcss/autoprefixer/blob/master/README.md#browsers
 */

'use strict';

var autoprefixer = require('autoprefixer');
var async = require('async');

module.exports = function(browserVersions) {
	function prefix(file, cb) {
		file.contents(autoprefixer.process(file.contents(), browserVersions).css);
		cb(null, file);
	}

	return function(files, cb) {
		async.map(files, prefix, cb);
	};
};
