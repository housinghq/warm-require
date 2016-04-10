module.exports = {
	INVALID_ARGUMENTS: {
		code: 1,
		message: 'Invalid Arguments or Invalid Argument Length.'
	},
	NON_ABSOLUTE_PATH: {
		code: 2,
		message: 'hot-require does not work with relative paths.\nUse cwd or NODE_PATH or _dirname.'
	},
	TRANSPILER_NON_FUNCTION: {
		code: 4,
		message: 'transpiler is not a function.'
	},
	FILE_DOES_NOT_EXIST: {
		code: 5,
		message: 'File you requested does not exist.'
	}
}
