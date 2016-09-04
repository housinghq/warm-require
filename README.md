# warm-require
> Hot reload for server

You can read about the implementation [here](https://medium.com/engineering-housing/reloading-your-node-modules-on-change-5f5152dc5084#.pe2rnkmie)

## Features
* Reload files which changed
* update file when any sub-dependency is modified

##installation
```
npm i --save-dev warm-require
```

##Usage
```js
//index.js
var warmRequire = require('./warm-require-config');
var hotModule = warmRequire(__dirname + '/module');

function whichGetsCalledOnEveryRequest() {
	// Reload it.
	hotModule = warmRequire(__dirname + '/module');

	// Use it.
	render(hotModule);
}
```

```js
// warm-require-config.js
if (process.env.NODE_ENV === 'production') {
	module.exports = require;
} else {
	var warmRequire = require('warm-require').watch({
		paths: __dirname + '/**/*.jsx' // used anymatch. https://github.com/es128/anymatch.
	});
	module.exports = warmRequire;
}
```

## Known issues
* You cannot use with ES6's import statement. It is immutable to make it statically analyzable, so that it would work in browsers as well. (Arrgh) So you will have to use var or let.

## Todo

- [x] [Publish a blog about its working](https://medium.com/engineering-housing/reloading-your-node-modules-on-change-5f5152dc5084#.pe2rnkmie)
- [ ] Add test cases. Check on multiple node versions.
- [ ] Use [callsites](https://github.com/sindresorhus/callsites) to enable relative require.

License @ MIT


