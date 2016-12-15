
'use strict';

var async = require('async');
var minimatch = require('minimatch');

function filter(context, options, processor, file, cb) {
	var glob = options.glob;
	var production = context.getProduction();

	var fileAllowed = !glob || minimatch(file.filename(), glob);
	var productionAllowed = !options.production || options.production === production;

	if (fileAllowed && productionAllowed) {
		processor(context, file, cb);
	} else {
		cb(null, file);
	}
}

module.exports = function(rawOptions, processor, postProcessCb) {
	var options = rawOptions || {};

	return function(files, cb) {
		var context = this;

		async.map(files, filter.bind(null, context, options, processor), function(err, newFiles) {
			if (postProcessCb) {
				postProcessCb.call(context, err, newFiles, cb);
			} else {
				cb(err, newFiles);
			}
		});
	};
};
