var Module = module.constructor;
var fs = require('graceful-fs');
var path = require('path');
var anymatch = require('anymatch');

// Modules
var errors = require('./errors');

// Variables
var depsTree = {},
	loading = {},
	absCacheMap = {};

// Not Pure
function recursiveBurst(filename) {
	delete Module._cache[require.resolve(filename)];
	if (!depsTree[filename]) return;
	return depsTree[filename].forEach(recursiveBurst);
}

// Not Pure
function burst(filename) {
	delete Module._cache[require.resolve(filename)];
	return recursiveBurst(filename);
}

// Not Pure
function addDependent(dependent, filename) {
	if (!dependent) {
		return
	}

	if (!depsTree[filename]) {
		depsTree[filename] = [];
	}
	if (depsTree[filename].indexOf(dependent) === -1) {
		depsTree[filename].push(dependent);
	}
}

exports.burst = burst;
exports.default = function(config) {
	return function warmRequire(request, parent) {
		if ( (arguments.length < 1) || (arguments.length > 2) )
			throw errors.INVALID_ARGUMENTS;

		var filename = Module._resolveFilename(request, parent);
		if (!filename) {
			throw errors.FILE_DOES_NOT_EXIST;
		}

		if (!anymatch(config.paths, filename)) {
			return require(filename);
		}

		if (parent) {
			addDependent(parent.filename, filename);
		}

		var cachedModule = Module._cache[filename];
		if (cachedModule) {
			return cachedModule.exports;
		}

		var m = new Module(filename);
		Module._cache[filename] = m;
		m.require = function(targetPath) {
			return warmRequire(targetPath, m);
		}
		m.load(filename);

		return m.exports;
	};
};
