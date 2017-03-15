
/**
 * Inject reference to files into a file
 *
 * Currently only support for html and css files
 */

'use strict';

var path = require('path');

var _ = require('lodash');
var async = require('async');
var minimatch = require('minimatch');

var __root = process.cwd();

function findInjectableFiles(files, glob) {
	return files.filter(function(file) {
		return minimatch(file.filename(), glob);
	});
}

function getPatternInfo(file) {
	if (_.endsWith(file.filename(), '.html')) {
		return {
			pattern: /<!-- ?inject:(js|css|img)(\(([^)]+)\))? ?-->/g,
			filenameFilter: 3,
			templates: {
				'.js': '<script src="{url}"></script>',
				'.css': '<link rel="stylesheet" href="{url}">',
				'.img': '<img src="{url}">',
			},
		};
	} else if (_.endsWith(file.filename(), '.css')) {
		return {
			pattern: /url\(('|")?([^\1]+?)\1\)/g,
			filenameFilter: 2,
			templates: 'url({url})',
		};
	}

	throw new Error('Unsupported file');
}

function injectSourcesForFile(context, base, srcBase, files, sourceFile, cb) {
	var manifest = context.getManifest(base).filter(function(file) {
		return file.file.filename() !== sourceFile.filename();
	});

	var content = sourceFile.contents();
	var patternInfo = getPatternInfo(sourceFile);
	var urlPattern = /{url}/g;
	var match;
	var extension;
	var filenameFilter;
	var urls;
	var injectableContent;
	var replacements = [];

	// eslint-disable-next-line no-cond-assign
	while (match = patternInfo.pattern.exec(content)) {
		extension = '.' + match[1];
		filenameFilter = match[patternInfo.filenameFilter];
		urls = [];

		// eslint-disable-next-line no-loop-func
		manifest.forEach(function(file) {
			var fileExtension = path.extname(file.file.filename());
			var fileRelativeFilename;

			if (file.file.originalFilename()) {
				fileRelativeFilename = path.relative(path.join(__root, srcBase), file.file.originalFilename());
			}

			if (patternInfo.templates[extension] && fileExtension === extension
				|| fileRelativeFilename && filenameFilter === fileRelativeFilename
			) {
				urls.push(file.url);
			}
		});

		if (urls.length === 0) {
			continue;
		}

		// eslint-disable-next-line no-loop-func
		injectableContent = urls.map(function(url) {
			return (patternInfo.templates[extension] || patternInfo.templates).replace(urlPattern, url);
		}).join('');

		replacements.push({
			location: [match.index, match.index + match[0].length],
			what: injectableContent,
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

		sourceFile.contents(content);
	}

	cb(null, files);
}

function injectSources(context, base, srcBase, files, injectableFiles, cb) {
	async.eachSeries(injectableFiles, injectSourcesForFile.bind(null, context, base, srcBase, files), function() {
		cb(null, files);
	});
}

module.exports = function(fileGlob, rawOptions) {
	var options = rawOptions || {};
	var base = options.base || '';
	var srcBase = options.srcBase || '';

	if (!fileGlob) {
		throw new Error('`fileGlob` is not set');
	}

	return function inject(files, cb) {
		var context = this;
		var injectableFiles = findInjectableFiles(files, fileGlob);

		if (!injectableFiles.length) {
			cb(null, files);
		} else {
			injectSources(context, base, srcBase, files, injectableFiles, cb);
		}
	};
};
