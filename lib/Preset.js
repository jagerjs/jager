
'use strict';

var path = require('path');

var Loader = require('./Loader');

function Preset(name, options) {
	this.name = name;
	this.normalizedName = this.normalizeName();
	this.options = options;
	this.instance = null;
	this.chain = null;

	this.require();
}

Preset.prototype.normalizeName = function Preset$normalizeName() {
	return 'jager-preset-' + this.name;
};

Preset.prototype.require = function Preset$require() {
	var locations = [
		this.normalizedName,
		path.join(__dirname, '../presets/' + this.normalizedName), // built-in presets
	];

	this.instance = Loader.load(locations);

	if (!this.instance) {
		throw new Error('Could not load preset: ' + this.name);
	}

	this.chain = this.instance.call(null, this.options);
};

Preset.load = function Preset$load(name, options) {
	return new Preset(name, options);
};

module.exports = Preset;
