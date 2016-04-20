var watch = require('./chokidar-config');
var loader = require('./module-loader');
var errors = require('./errors');

function onChange(file) {
	loader.burst(file);
};

exports.watch = function(config) {
	var watcher = watch(config, onChange);
	return loader.default(config);
};
