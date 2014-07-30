
'use strict';

var async = require('async');
var path = require('path');
var jsStringEscape = require('js-string-escape');

var __root = process.cwd();

var prefix = 'angular.module("templates", []).run(["$templateCache", function($templateCache) {';
var suffix = '}]);';

module.exports = function(options) {
	var base = (options && options.base || '').replace(/\/$/, '') + '/';
	var filename = options && options.filename || 'templates.js';

	function process(file, cb) {
		var url = file.filename.replace(path.join(__root, base), '');
		cb(null, '$templateCache.put("' + url + '", "' + jsStringEscape(file.contents.toString('utf8')) + '");');
	}

	return function autoprefixer(files, cb) {
		async.map(files, process, function(err, files) {
			cb(null, [{
				filename: path.join(__root, base, filename),
				contents: new Buffer(prefix + files.join('') + suffix)
				}]);
		});
	};
};
