
/**
 * Reloads your browser when files change
 *
 * Notify the browser of any changes in your chain, compatible with at least the [Chrome plugin] and [Firefox plugin]. If you don't want to use a browser plugin and are using the `inject` plugin, you can set the `injectScriptLocation` to `true`.
 *
 * **API**: `('livereload'[, options])`
 *
 * - `options`:
 *     - `port`: port used by the livereload server (default: `35729`)
 *     - `injectScriptLocation`: Inject the location of the listener script
 *
 * [Chrome plugin]: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
 * [Firefox plugin]: https://addons.mozilla.org/en-us/firefox/addon/livereload/
 */

'use strict';

var tinylr = require('tiny-lr');

var jager = require('./../jager');

var LIVE_RELOAD_SCRIPT_LOCATION = 'http://localhost:PORT/livereload.js';

var defaultPort = 35729;
var servers = {};
var contentCache = {};

function notify(livereloadServer, injectScriptLocation, files, cb) {
	var filesToNotify;

	if (files.length) {
		filesToNotify = [];

		files.forEach(function(file) {
			var filename = file.filename();

			if (file.isUrl()) {
				return;
			}

			if (!contentCache[filename] || contentCache[filename] !== file.contents()) {
				filesToNotify.push(filename);
			}

			contentCache[filename] = file.contents();
		});
	} else {
		filesToNotify = ['*'];
	}

	if (filesToNotify.length) {
		livereloadServer.changed({
			body: {
				files: filesToNotify,
			},
		});
	}

	if (injectScriptLocation) {
		files.push(jager.File.createUrl(
			LIVE_RELOAD_SCRIPT_LOCATION.replace('PORT', livereloadServer.port)));
	}

	cb(null, files);
}

module.exports = function(rawOptions) {
	var options = rawOptions || {};
	var port = parseInt(options.port || defaultPort, 10);
	var injectScriptLocation = !!options.injectScriptLocation;

	if (!servers[port]) {
		servers[port] = {
			livereloadServer: new tinylr.Server(options),
			port: port,
			listening: false,
			startup: false,
			callbacks: [],
		};
	}

	return function livereload(files, cb) {
		if (servers[port].listening) {
			notify(servers[port].livereloadServer, injectScriptLocation, files, cb);
		} else {
			servers[port].callbacks.push(function() {
				notify(servers[port].livereloadServer, injectScriptLocation, files, cb);
			});

			// we are already starting up this server
			if (!servers[port].startup) {
				servers[port].startup = true;

				servers[port].livereloadServer.listen(port, function() {
					servers[port].listening = true;

					// execute all calls created while we were starting up
					(function loop(callbacks) {
						var callback = callbacks.shift();

						if (callback) {
							callback();
							loop(callbacks);
						}
					}(servers[port].callbacks));
				});
			}
		}
	};
};
