
/**
 * Create a version of angular-js-file that is uglify save
 *
 * Create an properly annotated version of a angular file with [ng-annotate].
 *
 * **API**: `('ng-annotate')`
 *
 * [ng-annotate]: https://github.com/olov/ng-annotate
 */

'use strict';

var ngAnnotate = require('ng-annotate');

var gatedMap = require('./../lib/gated-map');

var options = {
	add: true,
};

module.exports = function() {
	function processNgAnnotate(context, file, cb) {
		var annotateResult = ngAnnotate(file.contents(), options);

		if (annotateResult.errors) {
			cb(annotateResult.errors.join('\n'));
		} else {
			file.contents(annotateResult.src);
			cb(null, file);
		}
	}

	return gatedMap({ glob: '**/*.js' }, processNgAnnotate);
};
