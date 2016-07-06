#!/usr/bin/env node

'use strict';
var Liftoff = require('liftoff');
var subarg = require('subarg');

// applies only to top level command
var argOptions = {
	'boolean': [ 'watch' ],
	alias: {
		w: [ 'watch' ],
	},
	'default': {
		watch: false,
	},
};

var argv = subarg(process.argv.slice(2), argOptions);

var cli = new Liftoff({
	name: 'jager',
	configName: 'jagerfile',
	extensions: {
		'.js': null,
	},
});

cli.launch({}, function(env) {
	var jager = require(env.modulePath);
	var tasks = [];

	if (env.configPath) {
		require(env.configPath);

		tasks = argv._.length ? argv._ : ['default'];
	} else if (argv.preset) {
		var presets = Array.isArray(argv.preset) ? argv.preset : [argv.preset];

		presets.forEach(function(preset) {
			var name = preset.name ? preset.name : preset._.shift();
			delete preset.name;

			var options = preset._.shift();
			delete options._;

			var watch = (!!preset.watch) || argv.watch;
			delete preset.watch;

			jager.preset(name, options);

			if (watch) {
				tasks.push(name + ':watch');
			} else {
				tasks.push(name);
			}
		});
	}

	jager.run(tasks, argv.debug === true);
});
