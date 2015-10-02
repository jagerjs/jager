
'use strict';

var CleanCSS = require('clean-css');
var async = require('async');

function processCss(context, options, file, cb) {
	new CleanCSS(options).minify(file.contents(), function(err, minified) {
		if (err) {
			cb(err);
		} else {
			file.contents(minified.styles);
			cb(null, file);
		}
	});
}

module.exports = function(options) {
	return function(files, cb) {
		async.map(files, processCss.bind(null, this, options), cb);
	};
};
