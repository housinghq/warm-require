var watch = require('./chokidar-config');
var loader = require('./module-loader');
var errors = require('./errors');

function dummyTranspiler(str) {
	return str;
}

function objTranspiler(obj, str, filename) {
	var extMatch = filename.match(/\.[^\/]*$/);
	if (extMatch && extMatch.length) {
		var ext = extMatch[0].slice(1);
		if (typeof(obj[ext]) === 'function' ) {
			return obj[ext](str);
		}
	}

	return str;
}

function onChange(file) {
	loader.burst(file);
};

exports.watch = function(config) {
	var watcher = watch(config, onChange);

	if (!config.transpiler) {
		config.transpiler = dummyTranspiler;
	} else if ( typeof(config.transpiler) === 'object' ) {
		config.transpiler = objTranspiler.bind(null, config.transpiler);
	}
	if ( typeof(config.transpiler) !== 'function' ) {
		throw errors.TRANSPILER_NON_FUNCTION;
	}

	if (!config.exts) {
		config.exts = ['js'];
	} else if (config.exts.indexOf('js') === -1) {
		config.exts.push('js');
	}

	return loader.warmRequire.bind(null, config);
};
