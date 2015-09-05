
'use strict';

var path = require('path');

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

Context.prototype._add = function Context$_add(what, filename) {
	var files = [];

	if (Array.isArray(filename)) {
		filename.forEach(function(file) {
			if (what.indexOf(file) === -1) {
				files.push(file);
			}
		});
	} else if (what.indexOf(filename) === -1) {
		files.push(filename);
	}

	files.forEach(function(file) {
		what.push(path.resolve(file));
	});

	if (this._watcher) {
		this._watching.add(files);
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

Context.prototype.getAllDependencies = function Context$getAllDependencies() {
	return this._sources.concat(this._dependencies);
};

module.exports = Context;
