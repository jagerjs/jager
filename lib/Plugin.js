
'use strict';

var trycatch = require('trycatch');

var Logger = require('./Logger');

// does not always seem to work correctly, so we disable it for now
// trycatch.configure({
// 	'long-stack-traces': true
// });

function Plugin(name, args) {
	if (typeof name === 'function') {
		this.name = '[anonymous]';

		this.executable = name;
	} else {
		this.name = name;
		this.normalizedName = this.normalizeName();
		this.args = args;
		this.instance = null;
		this.executable = null;

		this.require();
	}
}

Plugin.prototype.normalizeName = function Plugin$normalizeName() {
	return 'jager-' + this.name;//this.name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

Plugin.prototype.require = function Plugin$require() {
	var locations = [
		this.normalizedName,
		'./../plugins/' + this.normalizedName // built-in plugins
	];

	while (locations.length) {
		try {
			this.instance = require(locations.shift());
			break;
		} catch (e) {
			if (e.code !== 'MODULE_NOT_FOUND') {
				Logger.error(e);
			}
		}
	}

	if (!this.instance) {
		throw new Error('Could not load plugin: ' + this.name);
	}

	this.executable = this.instance.apply(null, this.args);
};

Plugin.prototype.execute = function Plugin$execute(chain, cb) {
	var executable = this.executable;
	var callbackCalled = false;

	function aftermath(err, result) {
		if (!callbackCalled) {
			cb(err, result);
		}
	}

	trycatch(function() {
		executable.call(chain.meta, chain.files, aftermath);
	}, aftermath);
};

module.exports = Plugin;
