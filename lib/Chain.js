
'use strict';

var path = require('path');
var fs = require('fs');

var Promise = require('bluebird');
var domain = require('domain');
var async = require('async');
var prettyHrtime = require('pretty-hrtime');
var chalk = require('chalk');
var chokidar = require('chokidar');

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

Chain.prototype.run = function Chain$run(files, cb) {
	var that = this;
	var start = process.hrtime();
	var chain = [];
	var lastChackle = that.chain.getChackle();

	that.files = files;
	that.meta = {};

	if (that.task.options.watch) {
		that.meta.watch = true;
	}

	do {
		if (lastChackle.getPlugin()) {
			chain.unshift(lastChackle);
		}

		lastChackle = lastChackle.getParent();
	}
	while (lastChackle);

	async.eachSeries(chain, function serieLooper(chackle, cb) {
		chackle.getPlugin().execute(that, function chainLooper(err, files) {
			if (err) {
				cb(err);
			} else {
				that.files = files;
				cb();
			}
		});
	}, function serieHandler(err) {
		cb(err, that.files);

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

	var src = that.meta.jagerSrc || [];
	var dependencies = that.meta.jagerSrcDependencies || [];

	var watcher = chokidar.watch(src.concat(dependencies)).on('ready', function() {
		watcher.on('all', function(ev, pathname) {
			Logger.log('(' + chalk.blue(ev) + ') ' + chalk.magenta(path.relative(__root, pathname)));
			that.task.run();
		});
	});
};

module.exports = Chain;
