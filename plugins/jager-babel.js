
'use strict';

var async = require('async');
var babel = require('babel');

function compileBabel(options, file, cb) {
	var result = babel.transform(file.contents(), options);

	file.contents(result.code);

	cb(null, file);
}

module.exports = function(options) {
	return function babel(files, cb) {
		async.map(files, compileBabel.bind(null, options), cb);
	};
};
