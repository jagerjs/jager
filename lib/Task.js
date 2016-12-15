
'use strict';

var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var prettyHrtime = require('pretty-hrtime');

var Chain = require('./Chain');

var Logger = require('./Logger');

// filters files based on filename, when duplicate is found, freshest is used
function uniqueFiles(list) {
	var result = [];
	var seen = {};

	list.forEach(function(item) {
		var filename = item.filename();
		var mtime;

		if (seen[filename]) {
			mtime = item.stat().mtime;

			if (seen[filename].mtime < mtime) {
				result.splice(seen[filename].index, 1, item);
				seen[filename].mtime = mtime;
			}
		} else {
			result.push(item);
			seen[filename] = {
				index: result.length - 1,
				mtime: item.stat().mtime,
			};
		}
	});

	return result;
}

function Task(name, options) {
	this.name = name;
	this.options = options;
	this.chains = [];
	this.scheduled = false;
	this.running = false;
}

Task.prototype.add = function Task$add(arg) {
	var that = this;
	var chains = Array.isArray(arg) ? arg : [arg];

	this.chains.push(chains.map(function(chain) {
		return new Chain(that, chain);
	}));
};

Task.prototype.run = function Task$run() {
	var that = this;

	if (!this.scheduled && !this.running) {
		that.scheduled = true;

		process.nextTick(function() {
			var files = [];
			var start;

			that.scheduled = false;

			if (!that.running) {
				that.running = true;
				start = process.hrtime();
				Logger.log('Starting "' + chalk.cyan(that.name) + '"…');

				function serieRunner(serie, cb) {
					function chainRunner(chain, cb) {
						chain.run(files, cb);
					}

					async.map(serie, chainRunner, function(err, mappedFiles) {
						files = uniqueFiles(_.flatten(mappedFiles));
						cb(err);
					});
				}

				function serieRunnerComplete(err) {
					var end = process.hrtime(start);
					that.running = false;

					if (err) {
						Logger.error('Error in "' + chalk.cyan(that.name) + '":', err);
					} else {
						Logger.log('Finished "' + chalk.cyan(that.name) + '" after ' + chalk.green(prettyHrtime(end)));
					}
				}

				async.mapSeries(that.chains, serieRunner, serieRunnerComplete);
			}
		});
	}
};

module.exports = Task;
