
'use strict';

var Logger = require('./Logger');

module.exports = {
	load: function(locations) {
		var location;
		var instance;

		while (locations.length) {
			try {
				location = locations.shift();
				instance = require(location);
				break;
			} catch (e) {
				if (e.code !== 'MODULE_NOT_FOUND') {
					Logger.error(e);
				}
			}
		}

		return instance;
	},
};
