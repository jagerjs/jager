
/**
 * Inject environment variables into javascript files using [envify]
 *
 * **API**: `('env', envVariable)`
 *
 * - `envVariable`: object with environment variable, ie: `process.env`
 *
 * [envify]: https://github.com/hughsk/envify
 */

'use strict';

var envify = require('envify/custom');
var gatedMap = require('./../lib/gated-map');

function processEnv(envVariables, context, file, cb) {
	var stream = envify(envVariables);
	var content = '';

	stream()
		.on('data', function(data) {
			content += data;
		})
		.on('end', function() {
			file.contents(content);
			cb(null, file);
		})
		.on('error', cb)
		.end(file.contents());
}

module.exports = function(envVariables) {
	return gatedMap({ glob: '**/*.js' }, processEnv.bind(null, envVariables));
};
