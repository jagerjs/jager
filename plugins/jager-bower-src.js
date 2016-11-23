
/**
 * Add files from your bower config
 *
 * Recursively add the main files from your bower config to your chain.
 *
 * **API**: `('bower', pattern)`
 *
 * - `pattern`: glob to match the wanted bower package, ex: `'jquery'` would add the main file for jquery
 */

'use strict';

var path = require('path');
var fs = require('fs');

var minimatch = require('minimatch');
var async = require('async');

var find = require('lodash/find');

var jager = require('./../jager');

var __root = process.cwd();

function loadBowerJson(base, cb) {
	var defaultBowerJson = path.join(base, 'bower.json');

	fs.readFile(defaultBowerJson, 'utf8', function(err, contents) {
		if (err) {
			cb(err);
		} else {
			try {
				cb(null, JSON.parse(contents));
			} catch (e) {
				cb(e);
			}
		}
	});
}

function loadBowerDirectory(base, cb) {
	var defaultBowerDirectory = path.join(base, 'bower_components');
	var bowerRc = path.join(base, '.bowerrc');

	fs.readFile(bowerRc, 'utf8', function(err, contents) {
		var json;

		if (err && err.code === 'ENOENT') {
			cb(null, defaultBowerDirectory);
		} else if (err) {
			cb(err);
		} else {
			try {
				json = JSON.parse(contents);

				if (json.directory) {
					cb(null, path.join(base, json.directory));
				} else {
					cb(null, defaultBowerDirectory);
				}
			} catch (e) {
				cb(e);
			}
		}
	});
}

function createAdd(bowerJson) {
	return function add(name, cb) {
		if (!bowerJson.dependencies[name]) {
			cb(new Error('Invalid dependency: ' + name));
		} else {
			loadBowerDirectory(__root, function(err, directory) {
				if (err) {
					cb(err);
				} else {
					loadBowerJson(path.join(directory, name), function(err, dependencyBowerJson) {
						var filenames;

						if (err) {
							cb(err);
						} else {
							filenames = (Array.isArray(dependencyBowerJson.main) ? dependencyBowerJson.main : [dependencyBowerJson.main])
								.map(function(filename) { return path.join(directory, name, filename); });

							async.map(filenames, jager.File.create, function(err, newFiles) {
								cb(err, {
									bowerJson: dependencyBowerJson,
									newFiles: newFiles,
								});
							});
						}
					});
				}
			});
		}
	};
}

function processResults(result, cb) {
	var files = [];

	if (result.bowerJson && result.bowerJson.dependencies) {
		var dependenciesNames = Object.keys(result.bowerJson.dependencies);
		processDependencies(result.bowerJson, dependenciesNames, function(err, rs) {
			if (err) {
				cb(err);
			} else {
				files = files.concat(rs);
				cb(null, files);
			}
		});
	} else {
		cb(null, files);
	}
}

function processDependencies(bowerJson, dependencies, cb) {
	var add = createAdd(bowerJson);

	async.map(dependencies, add, function(err, results) {
		if (err) {
			cb(err);
		} else {
			async.map(results, processResults, function(err, dependenciesResult) {
				var files = [];

				if (err) {
					cb(err);
				} else {
					dependenciesResult.forEach(function(list) {
						files = files.concat(list);
					});

					results.forEach(function(result) {
						files = files.concat(result.newFiles);
					});

					cb(null, files);
				}
			});
		}
	});
}

module.exports = function(name) {
	return function bowerSrc(files, cb) {
		var that = this;

		loadBowerJson(__root, function(err, bowerJson) {
			var matchingDependencyNames;

			if (err) {
				cb(err);
			} else if (!bowerJson.dependencies) {
				cb(new Error('No dependencies found'));
			} else {
				matchingDependencyNames = Object.keys(bowerJson.dependencies)
					.filter(function(dep) { return minimatch(dep, name); });

				processDependencies(bowerJson, matchingDependencyNames, function(err, newFiles) {
					if (err) {
						cb(err);
					} else {
						newFiles.forEach(function(newFile) {
							var exists = find(files, function(file) {
								return file.filename() === newFile.filename();
							});

							if (!exists) {
								that.addSource(newFile.filename());
								files.push(newFile);
							}
						});

						cb(null, files);
					}
				});
			}
		});
	};
};
