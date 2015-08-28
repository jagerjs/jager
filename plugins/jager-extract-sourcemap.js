
'use strict';

var path = require('path');
var stream = require('stream');

var mold = require('mold-source-map');
var async = require('async');

var jager = require('./../jager');

function createStream(file) {
	var inputStream = new stream.Readable();
	inputStream._read = function(){};
	inputStream.push(file.contents());
	inputStream.push(null);

	return inputStream;
}

// inspired by https://github.com/thlorenz/exorcist
function extractSourceMap(file, src) {
	var json = src.toJSON(2);
	var comment = '';
	var commentRx = /^\s*\/(\/|\*)[@#]\s+sourceMappingURL/mg;
	var commentMatch = commentRx.exec(src.source);
	var commentBlock = (commentMatch && commentMatch[1] === '*');

	var filename = file.filename() + '.map';
	var url = path.basename(filename);

	if (commentBlock) {
		comment = '/*# sourceMappingURL=' + url + ' */';
	} else {
		comment = '//# sourceMappingURL=' + url;
	}

	return {
		filename: filename,
		json: json,
		comment: comment,
	};
}

module.exports = function() {
	return function(files, cb) {
		async.map(files, function(file, cb) {
			var inputStream = createStream(file);
			var contents = '';

			inputStream.pipe(mold.transform(function(src, write) {
				var result;
				var mapFile;

				if (src.sourcemap) {
					result = extractSourceMap(file, src);

					mapFile = new jager.File(result.filename, result.json);
					files.push(mapFile);

					write(result.comment);
				} else {
					write(src.source);
				}
			})).on('data', function(content) {
				contents += content;
			}).on('end', function() {
				file.contents(contents);

				cb();
			});
		}, function(err) {
			// we manipulate the original list of files,
			// so we don't use the result of the async.map
			cb(err, files);
		});
	};
};
