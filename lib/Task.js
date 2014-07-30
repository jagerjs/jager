
'use strict';

var async = require('async');
var chalk = require('chalk');
var prettyHrtime = require('pretty-hrtime');

var Chain = require('./Chain');

var Logger = require('./Logger');

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
			var start;

			that.scheduled = false;

			if (!that.running) {
				that.running = true;
				start = process.hrtime();
				Logger.log('Starting "' + chalk.cyan(that.name) + '"…');

				async.eachSeries(that.chains, function(serie, cb) {
					async.each(serie, function(chain, cb) {
						chain.run(cb);
					}, cb);
				}, function(err) {
					var end = process.hrtime(start);
					that.running = false;

					if (err) {
						Logger.error('Error in "' + chalk.cyan(that.name) + '":', err);
					} else {
						Logger.log('Finished "' + chalk.cyan(that.name) + '" after ' + chalk.green(prettyHrtime(end)));
					}
				});
			}
		});
	}
};

module.exports = Task;
