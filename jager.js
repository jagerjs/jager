
// _@/' _@/' _@/' _@/' _@/' _@/' _@/' _@/' _@/' _@/' _@/' _@/' _@/'? '\@_
'use strict';

var _ = require('lodash');

var Chackle = require('./lib/Chackle');
var Plugin = require('./lib/Plugin');
var Task = require('./lib/Task');
var File = require('./lib/File');

var Logger = require('./lib/Logger');

var __root = process.cwd();

function getChackleBuilder() {
	function createChackleLinker(parent) {
		return (function(/* name [, ...] */) {
			var b = function() {
				var args = Array.prototype.slice.call(arguments);
				var name = args.shift();
				var plugin = new Plugin(name, args);
				var child = new Chackle(parent, plugin);

				parent.add(child);
				return createChackleLinker(child);
			};

			b.getChackle = function() {
				return parent;
			};

			return b;
		}());
	}

	return createChackleLinker(new Chackle());
}

var tasks = {};

module.exports = {
	create: function create(start) {
		var chackleBuilder = getChackleBuilder();

		if (start) {
			start.forEach(function(item) {
				chackleBuilder = chackleBuilder.apply(null, item);
			});
		}

		return chackleBuilder;
	},
	task: function task(/* name, [options,] chain[, chain[, chain ...]] */) {
		var args = Array.prototype.slice.call(arguments);
		var name = args.shift();
		var options = _.isPlainObject(args[0]) ? args.shift() : {};

		if (!tasks[name]) {
			tasks[name] = new Task(name, options);

			args.forEach(function(arg) {
				if (typeof arg === 'function' || Array.isArray(arg)) {
					tasks[name].add(arg);
				}
			});
		} else {
			Logger.error('Duplicate task name: ' + name);
		}
	},
	run: function(tasklist) {
		tasklist.forEach(function(task) {
			if (tasks[task]) {
				tasks[task].run();
			} else {
				Logger.error('Unknown task: ' + task);
			}
		});
	},
	File: File
};
