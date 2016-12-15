
/**
 * Inject reference to files into a html file
 */

'use strict';

var path = require('path');

var _ = require('lodash');
var minimatch = require('minimatch');

var templates = {
	'.js': '<script src="{url}"></script>',
	'.css': '<link rel="stylesheet" href="{url}">',
};

function regexSafe(text) {
	return text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}

function findHtmlFile(files, glob) {
	return _.find(files, function(file) {
		return minimatch(file.filename(), glob);
	});
}

function injectSources(context, base, files, htmlFile, cb) {
	var manifest = context.getManifest(base).filter(function(file) {
		return file.file.filename() !== htmlFile.filename();
	});

	var filesInjected = false;
	var content = htmlFile.contents();
	var pattern = /<!-- ?inject:(\w+) ?-->/g;
	var urlPatterm = /{url}/g;
	var match;
	var extension;
	var urls;
	var injectableHtml;

	// eslint-disable-next-line no-cond-assign
	while (match = pattern.exec(content)) {
		extension = '.' + match[1];
		urls = [];

		if (!templates[extension]) {
			continue;
		}

		// eslint-disable-next-line no-loop-func
		manifest.forEach(function(file) {
			var fileExtension = path.extname(file.file.filename());

			if (fileExtension === extension) {
				urls.push(file.url);
			}
		});

		if (urls.length === 0) {
			continue;
		}

		// eslint-disable-next-line no-loop-func
		injectableHtml = urls.map(function(url) {
			return templates[extension].replace(urlPatterm, url);
		}).join('');

		content = content.replace(new RegExp(regexSafe(match[0]), 'g'), injectableHtml);

		filesInjected = true;
	}

	if (filesInjected) {
		htmlFile.contents(content);
	}

	cb(null, files);
}

module.exports = function(htmlFileGlob, rawOptions) {
	var options = rawOptions || {};
	var base = options.base || '';

	if (!htmlFileGlob) {
		throw new Error('`htmlFileGlob` is not set');
	}

	return function inject(files, cb) {
		var context = this;
		var htmlFile = findHtmlFile(files, htmlFileGlob);

		if (!htmlFile) {
			cb(null, files);
		} else {
			injectSources(context, base, files, htmlFile, cb);
		}
	};
};
