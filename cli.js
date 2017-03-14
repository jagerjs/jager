#!/usr/bin/env node

'use strict';
var Liftoff = require('liftoff');
var subarg = require('subarg');

// applies only to top level command
var argOptions = {
	'boolean': [ 'watch', 'production' ],
	alias: {
		w: [ 'watch' ],
	},
	'default': {
		watch: false,
		production: false,
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
	var production = process.env.NODE_ENV === 'production'
		|| argv.production === true
		|| argv.env === 'production';

	if (env.configPath) {
		require(env.configPath);

		tasks = argv._.length ? argv._ : ['default'];
	} else if (argv.preset) {
		var presets = Array.isArray(argv.preset) ? argv.preset : [argv.preset];

		presets.forEach(function(preset) {
			var name;

			if (typeof preset === 'string') {
				name = preset;
			} else if (preset.name) {
				name = preset.name;
				delete preset.name;
			} else if (preset._ && preset._.length) {
				name = preset._.shift();
			} else {
				throw new Error('Invalid preset name');
			}

			var options = preset;
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

	jager.run(tasks, {
		debug: argv.debug === true,
		production: production,
	});
});
