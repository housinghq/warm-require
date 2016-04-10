// NPM Packages
var fs = require('graceful-fs');
var path = require('path');

// Modules
var errors = require('./errors');

// Variables
var moduleCache = {},
	funcCache = {},
	depsTree = {},
	absCacheMap = {},
	nodePaths = [];

if (process.env.NODE_PATH) {
	nodePaths = process.env.NODE_PATH.split(';');
}

function isEmpty(obj) {
	for (var key in obj) {
		return false;
	}
	return true;
}

// Not Pure
function recursiveBurst(dependent) {
	moduleCache[dependent.absolute] = null;
	if (dependent.cachePath) {
		moduleCache[dependent.cachePath] = null;
		if (depsTree[dependent.cachePath])
			depsTree[dependent.cachePath].forEach(recursiveBurst);
	}
	if (!depsTree[dependent.absolute]) return;
	return depsTree[dependent.absolute].forEach(recursiveBurst);
}

// Not Pure
function burst(filename) {
	funcCache[filename] = null;
	if (absCacheMap[filename]) {
		funcCache[absCacheMap[filename]] = null;
	}
	return recursiveBurst({
		absolute: filename,
		cachePath: absCacheMap[filename]
	});
}

function genRelativeRequire(folder, filename) {
	return function(newfilename) {
		if (newfilename.charAt(0) === '.') {
			newfilename = path.resolve(folder, newfilename);
			if (!depsTree[newfilename]) {
				depsTree[newfilename] = [];
			}
			if (depsTree[newfilename].indexOf(filename) === -1) {
				depsTree[newfilename].push(filename);
			}
			return hot_require(newfilename);
		} else if (nodePaths.length) {

		}

		return require(newfilename);
	}
}

function checkPath(file) {
	var stats;
	try {
		stats = fs.statSync(file);
		if (stats.isDirectory()) {
			return file + '/index.js';
		}
		return file;
	} catch (e) {
		// Do nothing. Drink Tea.
	}
	try {
		stats = fs.statSync(file + '.js')
		if (!stats.isDirectory()) {
			return file + '.js'
		}
	} catch (e2) {
		// Drink Ice Tea, because you took that long to drink warm tea.
	}
	return null;
}

function absolutePath(folder, file) {
	if (file.charAt(0) === '.') {
		if (!folder) {
			throw errors.NON_ABSOLUTE_PATH;
		}
		return checkPath(path.resolve(folder, file));
	}
	if (file.charAt(0) === '/') {
		return checkPath(file);
	}
	for (var i=0; i<nodePaths.length; i++) {
		var test = checkPath( path.resolve(nodePaths[i], file) );
		if ( test ) {
			return test;
		}
	}
	return false;
}

// Not Pure
function addDependent(dependent, absolute) {
	if (!dependent) {
		return
	}

	if (!depsTree[absolute]) {
		depsTree[absolute] = [];
	}
	if (!depsTree[absolute].some(function(temp) {
		return temp.absolute === dependent.absolute;
	}) ) {
		depsTree[absolute].push(dependent);
	}
}

// Not Pure
function warmRequire(transpiler, folder, dependent, filename) {
	if ( (arguments.length < 2) || (arguments.length > 3) )
		throw errors.INVALID_ARGUMENTS;

	if (!filename) {
		filename = folder;
		folder = null;
	}

	var cachePath;
	if (filename.charAt(0) !== '.') {
		cachePath = filename;
		if (moduleCache[cachePath]) {
			return moduleCache[cachePath];
		}
		addDependent(dependent, cachePath);
	}

	var absolute = absolutePath(folder, filename);
	if (!absolute) {
		if (!cachePath) {
			throw errors.FILE_DOES_NOT_EXIST;
		}
		return moduleCache[cachePath] = require(filename);
	}

	if (!cachePath) {
		cachePath = absolute;
		addDependent(dependent, absolutePath);
	} else {
		absCacheMap[absolute] = cachePath;
	}
	if (moduleCache[absolute]) {
		return moduleCache[absolute];
	}

	var func = funcCache[absolute] || funcCache[cachePath];
	if (!func) {
		var code = transpiler( fs.readFileSync(absolute, {
			encoding: 'utf-8'
		}), absolute);

		func = funcCache[absolute] = new Function('require', 'module', 'exports', code);
		if (cachePath) {
			funcCache[cachePath] = funcCache[absolute];
		}
	}

	var targetFolder = path.dirname(filename);
	var targetDependent = {
		absolute: absolute
	};
	if (cachePath) {
		targetDependent.cachePath = cachePath;
	}
	var relativeRequire = warmRequire.bind(
		null,
		transpiler,
		targetDependent,
		targetFolder
	);

	var mod = {}, exp = {};
	mod.exports = {};

	func(relativeRequire, mod, exp);
	moduleCache[absolute] = isEmpty(exp) ? mod.exports : exp;
	if (cachePath) {
		moduleCache[cachePath] = moduleCache[absolute];
	}

	return moduleCache[absolute];
}

exports.burst = burst;
exports.warmRequire = warmRequire;