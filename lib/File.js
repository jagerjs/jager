
'use strict';

var path = require('path');
var fs = require('fs');

var __root = process.cwd();

function File(filename, contents) {
	this._filename = filename;

	this._contents = null;
	this._buffer = null;
	this._stat = null;

	if (contents !== undefined) {
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

File.prototype.contents = function(contents) {
	if (contents !== undefined) {
		this._buffer = null;
		this._contents = contents;
	} else if (this._contents === null) {
		this._contents = this._buffer.toString('utf8');
	}

	return this._contents;
};

File.prototype.buffer = function(buffer) {
	if (buffer !== undefined) {
		this._contents = null;
		this._buffer = buffer;
	} else if (this._buffer === null) {
		this._buffer = new Buffer(this._contents);
	}

	return this._buffer;
};

File.prototype.stat = function(stat) {
	if (stat !== undefined) {
		this._stat = stat;
	}

	return this._stat;
};

File.prototype.rename = function(newFilename) {
	this._filename = newFilename;
};


File.create = function(filename, cb) {
	var file = new File(path.join(__root, filename));

	fs.stat(filename, function(err, stat) {
		if (err) {
			cb(err);
		} else {
			file.stat(stat);

			fs.readFile(filename, function(err, buffer) {
				if (err) {
					cb(err);
				} else {
					file.buffer(buffer);
					cb(null, file);
				}
			});
		}
	});
};

module.exports = File;