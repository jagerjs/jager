
'use strict';

var path = require('path');

var async = require('async');
var jsStringEscape = require('js-string-escape');

var jager = require('../jager');

var __root = process.cwd();

var prefix = 'angular.module("templates", []).run(["$templateCache", function($templateCache) {';
var suffix = '}]);';

module.exports = function(options) {
	var base = (options && options.base || '').replace(/\/$/, '') + '/';
	var filename = options && options.filename || 'templates.js';

	function process(file, cb) {
		var url = file.filename().replace(path.join(__root, base), '');
		cb(null, '$templateCache.put("' + url + '", "' + jsStringEscape(file.contents()) + '");');
	}

	return function angularTemplates(files, cb) {
		async.map(files, process, function(err, newFiles) {
			if (err) {
				cb(err);
			} else {
				cb(null, [new jager.File(path.join(__root, base, filename), new Buffer(prefix + newFiles.join('') + suffix))]);
			}
		});
	};
};
