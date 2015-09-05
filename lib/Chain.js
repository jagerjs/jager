
'use strict';

var path = require('path');
var fs = require('fs');

var domain = require('domain');
var async = require('async');
var prettyHrtime = require('pretty-hrtime');
var chalk = require('chalk');
var chokidar = require('chokidar');

var Context = require('./Context');
var Logger = require('./Logger');

var __root = process.cwd();

function basename(filename) {
	return filename.replace(__root + '/', '');
}

function Chain(task, chain) {
	this.task = task;
	this.chain = chain;
	this.files = [];
	this.context = new Context(this);
	this.watching = false;
}

Chain.prototype.run = function Chain$run(files, cb) {
	var that = this;
	var start = process.hrtime();
	var chain = [];
	var lastChackle = that.chain.getChackle();

	that.context.setFiles(files);

	if (that.task.options.watch) {
		that.context.setWatching(true);
	}

	do {
		if (lastChackle.getPlugin()) {
			chain.unshift(lastChackle);
		}

		lastChackle = lastChackle.getParent();
	}
	while (lastChackle);

	function postLoop(err) {
		cb(err, that.context.getFiles());

		// start watching, even is we encounter an error,
		// a file change may fix the error
		if (!that.watching && that.task.options.watch) {
			that.watch();
		}
	}

	(function loop(chain) {
		var chackle = chain.shift();

		if (chackle) {
			chackle.getPlugin().execute(that, function(err, files) {
				if (err) {
					postLoop(err);
				} else {
					that.context.setFiles(files);
					loop(chain);
				}
			});
		} else {
			postLoop();
		}
	}(chain));
};

Chain.prototype.watch = function Chain$watch() {
	var that = this;

	that.watching = true;

	var watchableFiles = that.context.getAllDependencies();
	var watcher;


	watcher = chokidar.watch(watchableFiles).on('ready', function() {
		watcher.on('all', function(ev, pathname) {
			Logger.log('(' + chalk.blue(ev) + ') ' + chalk.magenta(path.relative(__root, pathname)));
			that.task.run();
		});
	});

	that.context.setWatcher(watcher);
};

module.exports = Chain;
