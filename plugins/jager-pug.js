
/**
 * Process pug files
 *
 * **API**: `('pug'[, options])`
 *
 * - `options`: See [pug options] for all the available options
 *
 * [pug options]: https://pugjs.org/api/reference.html#options
 */

'use strict';

var pug = require('pug');

var gatedMap = require('./../lib/gated-map');

function compilePug(options, context, file, cb) {
	options.pretty = !context.isProduction();
	options.filename = file.filename();

	try {
		file.contents(pug.render(file.contents(), options));
		cb(null, file);
	} catch (e) {
		cb(e);
	}
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};

	return gatedMap({ glob: '**/*.pug' }, compilePug.bind(null, options));
};
