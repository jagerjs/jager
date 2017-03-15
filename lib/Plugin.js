
'use strict';

var path = require('path');

var trycatch = require('trycatch');

var Loader = require('./Loader');

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

Plugin.prototype.getName = function Plugin$getName() {
	return this.name;
};

Plugin.prototype.normalizeName = function Plugin$normalizeName() {
	return 'jager-' + this.name;
};

Plugin.prototype.require = function Plugin$require() {
	var locations = [
		this.normalizedName,
		path.join(__dirname, '../plugins/' + this.normalizedName), // built-in plugins
	];

	this.instance = Loader.load(locations);

	if (!this.instance) {
		throw new Error('Could not load plugin: ' + this.name);
	}

	this.executable = this.instance.apply(null, this.args);
};

Plugin.prototype.execute = function Plugin$execute(chain, cb) {
	var executable = this.executable;
	var callbackCalled = false;
	var that = this;

	function aftermath(err, result) {
		if (!callbackCalled) {
			callbackCalled = true;
			cb(err, result);
		}
	}

	trycatch(function() {
		chain.context.setPlugin(that.getName());
		executable.call(chain.context, chain.context.getFiles(), aftermath);
	}, aftermath);
};

module.exports = Plugin;
