var chokidar = require("chokidar");

function watch(config, cb) {
	var chokidarOpts = config.chokidarOpts || {};
	if (!chokidarOpts.ignored) {
		// Ignore dotfiles
		chokidarOpts.ignored = /[\/\\]\./;
	}

	return chokidar.watch(config.paths, chokidarOpts)
		.on("change", cb);
}

module.exports = watch;
