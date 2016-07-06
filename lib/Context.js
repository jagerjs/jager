
'use strict';

var path = require('path');

var Logger = require('./Logger');

function Context(chain) {
	this._chain = chain;
	this._files = chain.files;
	this._sources = [];
	this._dependencies = [];

	this._watching = false;
	this._watcher = null;
}

Context.prototype.setFiles = function Context$setFiles(files) {
	this._files = files;
};

Context.prototype.getFiles = function Context$getFiles() {
	return this._files;
};

Context.prototype._add = function Context$_add(what, filename) { // eslint-disable-line camelcase
	var files = [];
	var resolvedFilename;

	if (Array.isArray(filename)) {
		filename.forEach(function(file) {
			resolvedFilename = path.resolve(file);

			if (what.indexOf(resolvedFilename) === -1) {
				files.push(resolvedFilename);
			}
		});
	} else {
		resolvedFilename = path.resolve(filename);

		if (what.indexOf(resolvedFilename) === -1) {
			files.push(resolvedFilename);
		}
	}

	files.forEach(function(file) {
		what.push(file);
	});

	if (this._watcher) {
		this._watcher.add(files);
	}
};

Context.prototype.addSource = function Context$addSource(filename) {
	this._add(this._sources, filename);
};

Context.prototype.addDependency = function Context$addDependency(filename) {
	this._add(this._dependencies, filename);
};

Context.prototype.setWatching = function Context$setWatching(flag) {
	this._watching = !!flag;
};

Context.prototype.isWatching = function Context$isWatching() {
	return this._watching;
};

Context.prototype.setWatcher = function Context$setWatcher(watcher) {
	this._watcher = watcher;
};

Context.prototype.getAllDependencies = function Context$getAllDependencies() {
	return this._sources.concat(this._dependencies);
};

Context.prototype.log = function Context$log(message) {
	Logger.log(message);
};

Context.prototype.debug = function Context$debug(message) {
	return Logger.debug('context', message);
};

module.exports = Context;
