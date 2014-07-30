
'use strict';

var chalk = require('chalk');
var growl = require('growl');

var packageInfo = require('../package');

function Logger() {}

Logger.prototype.log = function Logger$log() {
	var sig = '[' + chalk.green(packageInfo.name) + ']';
	var args = Array.prototype.slice.call(arguments);

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
		console.error(err);
	} else {
		args.push(err);
		console.error.apply(console, args);
	}
};

module.exports = new Logger();
