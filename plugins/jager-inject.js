
/**
 * Inject reference to files into a html file
 */

'use strict';

var path = require('path');

var async = require('async');
var minimatch = require('minimatch');

var __root = process.cwd();

var templates = {
	'.js': '<script src="{url}"></script>',
	'.css': '<link rel="stylesheet" href="{url}">',
	'.img': '<img src="{url}">',
};

function findHtmlFiles(files, glob) {
	return files.filter(function(file) {
		return minimatch(file.filename(), glob);
	});
}

function injectSourcesForFile(context, base, srcBase, files, htmlFile, cb) {
	var manifest = context.getManifest(base).filter(function(file) {
		return file.file.filename() !== htmlFile.filename();
	});

	var content = htmlFile.contents();
	var pattern = /<!-- ?inject:(\w+)(\(([^)]+)\))? ?-->/g;
	var urlPattern = /{url}/g;
	var match;
	var extension;
	var filenameFilter;
	var urls;
	var injectableHtml;
	var replacements = [];

	// eslint-disable-next-line no-cond-assign
	while (match = pattern.exec(content)) {
		extension = '.' + match[1];
		filenameFilter = match[3];
		urls = [];

		if (!templates[extension]) {
			continue;
		}

		// eslint-disable-next-line no-loop-func
		manifest.forEach(function(file) {
			var fileExtension = path.extname(file.file.filename());
			var fileRelativeFilename;

			if (file.file.originalFilename()) {
				fileRelativeFilename = path.relative(path.join(__root, srcBase), file.file.originalFilename());
			}

			if (fileExtension === extension || fileRelativeFilename && filenameFilter === fileRelativeFilename) {
				urls.push(file.url);
			}
		});

		if (urls.length === 0) {
			continue;
		}

		// eslint-disable-next-line no-loop-func
		injectableHtml = urls.map(function(url) {
			return templates[extension].replace(urlPattern, url);
		}).join('');

		replacements.push({
			location: [match.index, match.index + match[0].length],
			what: injectableHtml,
		});
	}

	if (replacements.length) {
		for (var i = replacements.length - 1; i >= 0; i--) {
			content = [
				content.slice(0, replacements[i].location[0]),
				replacements[i].what,
				content.slice(replacements[i].location[1]),
			].join('');
		}

		htmlFile.contents(content);
	}

	cb(null, files);
}

function injectSources(context, base, srcBase, files, htmlFiles, cb) {
	async.eachSeries(htmlFiles, injectSourcesForFile.bind(null, context, base, srcBase, files), function() {
		cb(null, files);
	});
}

module.exports = function(htmlFileGlob, rawOptions) {
	var options = rawOptions || {};
	var base = options.base || '';
	var srcBase = options.srcBase || '';

	if (!htmlFileGlob) {
		throw new Error('`htmlFileGlob` is not set');
	}

	return function inject(files, cb) {
		var context = this;
		var htmlFiles = findHtmlFiles(files, htmlFileGlob);

		if (!htmlFiles.length) {
			cb(null, files);
		} else {
			injectSources(context, base, srcBase, files, htmlFiles, cb);
		}
	};
};
