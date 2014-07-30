
'use strict';

var Promise = require('bluebird');
var domain = require('domain');
var stackTrace = require('stack-trace');
var async = require('async');
var watcher = require('glob-watcher');
var prettyHrtime = require('pretty-hrtime');
var chalk = require('chalk');
var fs = require('fs');

var Logger = require('./Logger');

var __root = process.cwd();

function basename(filename) {
	return filename.replace(__root + '/', '');
}

function Chain(task, chain) {
	this.task = task;
	this.chain = chain;
	this.files = [];
	this.meta = {};
	this.watching = false;
}

Chain.prototype.run = function Chain$run(cb) {
	var that = this;
	var start = process.hrtime();
	var chain = [];
	var lastChackle = that.chain.getChackle();

	that.files = [];
	that.meta = {};

	do {
		if (lastChackle.getPlugin()) {
			chain.unshift(lastChackle);
		}

		lastChackle = lastChackle.getParent();
	}
	while (lastChackle);

	async.eachSeries(chain, function serieLooper(chackle, cb) {
		chackle.getPlugin().execute(that, function chainLooper(err, files) {
			that.files = files;
			cb(err);
		});
	}, function serieHandler(err) {
		cb(err);

		// start watching, even is we encounter an error,
		// a file change may fix the error
		if (!that.watching && that.task.options.watch) {
			that.watch();
		}
	});
};

Chain.prototype.watch = function Chain$watch() {
	var that = this;

	this.watching = true;

	function yay(err) {
		return new Promise(function promiseRunner() {
			var src = that.meta.jagerSrc || [];
			var dependencies = that.meta.jagerSrcDependencies || [];

			watcher(src.concat(dependencies), function(ev) {
				Logger.log('(' + chalk.blue(ev.type) + ') ' + chalk.magenta(basename(ev.path)));
				that.task.run();
			});
		});
	}

	// TODO find a better way to do this
	function run() {
		yay().catch(function catchHandler(err) {
			// file not found, but we don't care
			if (err.code !== 'ENOENT') {
				Logger.error('NOOOOO', err);
			}

			run();
		});
	}

	run();
};

module.exports = Chain;
