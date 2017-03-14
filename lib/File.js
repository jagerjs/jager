
'use strict';

var path = require('path');
var fs = require('fs');

function File(filename, contents) {
	this._originalFilename = filename;
	this._filename = filename;

	this._contents = null;
	this._buffer = null;
	this._stat = { mtime: new Date() };
	this._isUrl = false;

	if (typeof contents !== 'undefined') {
		if (contents instanceof Buffer) {
			this._buffer = contents;
		} else {
			this._contents = contents;
		}
	}
}

File.prototype.filename = function() {
	return this._filename;
};

File.prototype.originalFilename = function() {
	return this._originalFilename;
};

File.prototype.contents = function(contents) {
	if (this._isUrl) {
		throw new Error('File is an URL and not be modified (' + this._filename + ')');
	}

	if (typeof contents !== 'undefined') {
		this._buffer = null;
		this._contents = contents;
		this._stat = { mtime: new Date() };
	} else if (this._contents === null) {
		this._contents = this._buffer.toString('utf8');
	}

	return this._contents;
};

File.prototype.buffer = function(buffer) {
	if (this._isUrl) {
		throw new Error('File is an URL and not be modified (' + this._filename + ')');
	}

	if (typeof buffer !== 'undefined') {
		this._contents = null;
		this._buffer = buffer;
		this._stat = { mtime: new Date() };
	} else if (this._buffer === null) {
		this._buffer = new Buffer(this._contents);
	}

	return this._buffer;
};

File.prototype.stat = function(stat) {
	if (typeof stat !== 'undefined') {
		if (this._isUrl) {
			throw new Error('File is an URL and not be modified (' + this._filename + ')');
		}

		this._stat = stat;
	}

	return this._stat;
};

File.prototype.rename = function(newFilename) {
	if (this._isUrl) {
		throw new Error('File is an URL and not be modified (' + this._filename + ')');
	}

	this._filename = newFilename;
	this._stat = { mtime: new Date() };
};

File.prototype.setUrl = function(url) {
	this._filename = url;
	this._isUrl = true;
};

File.prototype.isUrl = function() {
	return this._isUrl;
};


File.create = function(filename, cb) {
	var file = new File(path.resolve(filename));

	fs.stat(file.filename(), function(err, stat) {
		if (err) {
			cb(err);
		} else {
			fs.readFile(file.filename(), function(err, buffer) {
				if (err) {
					cb(err);
				} else {
					file.buffer(buffer);
					file.stat(stat);

					cb(null, file);
				}
			});
		}
	});
};

File.createUrl = function(url) {
	var file = new File();
	file.setUrl(url);

	return file;
};

module.exports = File;
