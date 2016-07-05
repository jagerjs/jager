
'use strict';

var ngAnnotate = require('ng-annotate');
var async = require('async');

var options = {
	add: true,
};

module.exports = function() {
	function processNgAnnotate(file, cb) {
		var annotateResult = ngAnnotate(file.contents(), options);

		if (annotateResult.errors) {
			cb(annotateResult.errors.join('\n'));
		} else {
			file.contents(annotateResult.src);
			cb(null, file);
		}
	}

	return function(files, cb) {
		async.map(files, processNgAnnotate, cb);
	};
};
