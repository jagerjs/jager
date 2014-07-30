
'use strict';

var async = require('async');
var less = require('less');

var __root = process.cwd();

function compileLess(file, cb) {
	var parser = new less.Parser({
		paths: [__root],
		filename: file.filename
	});

	parser.parse(file.contents.toString('utf8'), function(err, tree) {
		if (err) {
			cb(err);
		} else {
			file.contents = new Buffer(tree.toCSS({ compress: false }));
			cb(null, file);
		}
	});
}

module.exports = function() {
	return function less(files, cb) {
		async.map(files, compileLess, cb);
	};
};
