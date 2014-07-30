
'use strict';

function Chackle(parent, plugin) {
	this.parent = parent;
	this.plugin = plugin;
	this.descendents = [];
}

Chackle.prototype.add = function(chackle) {
	this.descendents.push(chackle);
};

Chackle.prototype.getParent = function Chackle$getParent() {
	return this.parent;
};

Chackle.prototype.getPlugin = function Chackle$getPlugin() {
	return this.plugin;
};

Chackle.prototype.getDescendents = function Chackle$getDescendents() {
	return this.descendents;
};

module.exports = Chackle;
