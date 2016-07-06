
'use strict';

var path = require('path');

var chalk = require('chalk');
var chokidar = require('chokidar');

var Context = require('./Context');
var Logger = require('./Logger');

var __root = process.cwd();

function Chain(task, chain) {
	this.task = task;
	this.chain = chain;
	this.files = [];
	this.context = new Context(this);
	this.watching = false;
}

Chain.prototype.run = function Chain$run(files, cb) {
	var that = this;
	var chain = [];
	var lastChackle = that.chain.getChackle();
	var chainNameSegments = [];
	var plugin;
	var logChainEnd;

	that.context.setFiles(files);

	if (that.task.options.watch) {
		that.context.setWatching(true);
	}

	do {
		plugin = lastChackle.getPlugin();

		if (plugin) {
			chainNameSegments.push(plugin.getName());
			chain.unshift(lastChackle);
		}

		lastChackle = lastChackle.getParent();
	}
	while (lastChackle);

	function postLoop(err) {
		logChainEnd();

		cb(err, that.context.getFiles());

		// start watching, even is we encounter an error,
		// a file change may fix the error
		if (!that.watching && that.task.options.watch) {
			that.watch();
		}
	}

	logChainEnd = Logger.debug('chain', chainNameSegments.reverse().join(','));
	(function loop(chain) {
		var chackle = chain.shift();
		var plugin;
		var logPluginEnd;

		if (chackle) {
			plugin = chackle.getPlugin();

			logPluginEnd = Logger.debug(plugin.getName());

			plugin.execute(that, function(err, files) {
				logPluginEnd();

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

	Logger.debug('watch');

	watcher = chokidar.watch(watchableFiles).on('ready', function() {
		watcher.on('all', function(ev, pathname) {
			Logger.log('(' + chalk.blue(ev) + ') ' + chalk.magenta(path.relative(__root, pathname)));
			that.task.run();
		});
	});

	that.context.setWatcher(watcher);
};

module.exports = Chain;
