#!/usr/bin/env node

'use strict';
var Liftoff = require('liftoff');
var argv = require('subarg')(process.argv.slice(2));

var cli = new Liftoff({
	name: 'jager',
	configName: 'jagerfile',
	extensions: {
		'.js': null,
	},
});

cli.launch({}, function(env) {
	require(env.configPath);

	var tasks = argv._.length ? argv._ : ['default'];
	var jager = require(env.modulePath);

	jager.run(tasks, argv.debug === true);
});
