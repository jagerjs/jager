
// TODO finish

'use strict';

var path = require('path');
var fs = require('fs');
var async = require('async');

var __root = process.cwd();

module.exports = function(destination, options) {
	return function(files, cb) {
		var f = [];
		var newFiles = ((options && options.file) ? [{ filename: options.file }] : files).map(function(file) {
			return path.join(__root, destination, path.basename(file.filename));
		});

		async.map(newFiles, fs.stat, function(err, stats) {
			// console.log(arguments);
		});

		cb(null, files);
	};
};
