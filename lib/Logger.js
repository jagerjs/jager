
/* eslint-disable no-console */
'use strict';

var prettyHrtime = require('pretty-hrtime');
var chalk = require('chalk');
var growl = require('growl');

var packageInfo = require('../package');

function Logger() {
	this._debug = false;
}

Logger.prototype.log = function Logger$log() {
	var sig = '[' + chalk.green(packageInfo.name) + ']';
	var args = Array.prototype.slice.call(arguments);

	args.unshift(sig);
	console.log.apply(console, args);
};

Logger.prototype.logFromPlugin = function Logger$logFromPlugin(plugin) {
	var sig = '[' + chalk.green(packageInfo.name) + ']';
	var args = Array.prototype.slice.call(arguments);
	var pluginName = '[' + chalk.yellow(plugin) + ']';

	args.shift();
	args.unshift(pluginName);
	args.unshift(sig);
	console.log.apply(console, args);
};

Logger.prototype.error = function Logger$error() {
	var sig = '[' + chalk.red(packageInfo.name) + ']';
	var args = Array.prototype.slice.call(arguments);
	var err = args.pop();

	args.unshift(sig);

	if (err instanceof Error) {
		growl(chalk.stripColor(args[1]) + ' ' + err.message); // TODO
		args.push(err.message);
		console.error.apply(console, args);

		if (err.stack) {
			console.error(err.stack);
		} else {
			console.error(err);
		}
	} else {
		args.push(err);
		console.error.apply(console, args);
	}
};

Logger.prototype.setDebug = function Logger$setDebug(debug) {
	this._debug = debug;
};

Logger.prototype.debug = function Logger$debug(namespace) {
	var sig = '[' + chalk.yellow(packageInfo.name + ':' + namespace) + ']';
	var args = Array.prototype.slice.call(arguments);
	var start = process.hrtime();
	var debug = this._debug;

	args.shift();
	args.unshift(sig);
	args.push('starting...');

	if (debug) {
		console.log.apply(console, args);
	}

	return function() {
		var end = process.hrtime(start);

		args.pop();
		args.push('done (' + prettyHrtime(end) + ')');

		if (debug) {
			console.log.apply(console, args);
		}
	};
};

module.exports = new Logger();
