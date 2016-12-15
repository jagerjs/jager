
'use strict';

var async = require('async');
var minimatch = require('minimatch');

function filter(glob, processor, file, cb) {
	if (minimatch(file.filename(), glob)) {
		processor(file, cb);
	} else {
		cb(null, file);
	}
}

module.exports = function(glob, files, processor, externalCb) {
	async.map(files, filter.bind(null, glob, processor), externalCb);
};
