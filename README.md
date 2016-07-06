# Jager [![Jager on NPM](http://img.shields.io/npm/v/jager.svg)](https://www.npmjs.com/package/jager)

> A simple build tool with a fluent interface

## Example
```js
var jager = require('jager');

// create a new chain of actions
var livereload = jager.create()
	('livereload'); // add a plugin to the chain

// create a chain which handles the javascript processing
var js = jager.create()
	('src', 'jagerfile.js') // source of the chain
	('uglify') // chain it to the uglify plugin
	('rename', 'renamed-jagerfile.js') //  rename the file
	('dest', '.'); // write the file

// create tasks to execute the defined chains
jager.task('js', js);

// `{ watch: true }` is used to tell jager to rerun the task when
// any of the source files or its dependencies change
jager.task('watch:js', { watch: true },  js, livereload);

// create a chain to process the less files
var less = jager.create()
	('src', 'main.less', { dependencies: '*.less' }) // specify a source file and a list of possible dependencies
	('less') // chain it to the less plugin
	('rename', 'main.css') // rename it
	('autoprefixer') // call the autoprefixer plugin on it
	('dest', '.'); // write the file

// create tasks for the less chains
jager.task('less', less);
jager.task('watch:less', { watch: true }, less, livereload);

// create a task for two chains, which will run simultaneously
jager.task('watch', { watch: true }, [js, less], livereload);
```

## Usage

Install with `npm install --save jager` and `npm install -g jager`, after create a `Jagerfile.js` file (see example above) in your project root. Then you can run `jager [task]` to execute your task.

Alternatively you can skip the global install and use the version in `node_modules/.bin/`, which is automatically added to your `PATH` when you run it with `npm run`. For example, the following `package.json` script would run the watch task without the globally installed version.

```json
{
	"scripts": {
		"watch": "jager watch"
	}
}
```

Run with `npm run watch`, no need for the global!

## Create a plugin

Plugins have pretty simple structure, like so:

```js
module.exports = function(options) {
	// the arguments to this function come from the `Jagerfile.js` file, for example:
	// `('src', 'script.js')` would give the `'script.js'` as argument

	return function(files, cb) {
		// files contains an array with `jager.File` instances, which you can manipulate
		cb(null, files);
	};
};
```

Jager automatically loads plugins when they follow the convention that when the module name is `jager-something-something`, it will load that plugin whenn you call it with `('something-something')`. You can also just pass the function you normally return in your plugin directly to Jager:

```js
jager.create()
	(function(files, cb) {
		cb(null, files);
	});
```

## `jager.File`

- `filename()`: Return the filename for the file
- `contents([string])`: When an argument is given, the contents are updated. Returns the contents
- `buffer([buffer]))`: When an argument is given, the internal buffer is updated. Return the internal buffer
- `stat([stat])`: When an argument is given, the stat is updated. Return the stat
- `rename(filename)`: Rename the file, the stat is updated to now

You can use both `contents()` and `buffer()` mixed, they will be converted on the fly when needed.

## Built-in plugins

Jager has some builtin plugins to get you started:

- [`src`: Add source files](https://github.com/jagerjs/jager/blob/master/plugins/jager-src.js)
- [`dest`: Write files](https://github.com/jagerjs/jager/blob/master/plugins/jager-dest.js)
- [`browserify`: Process a file with browserify](https://github.com/jagerjs/jager/blob/master/plugins/jager-browserify.js)
- [`newer`: Filter old files out of the chain](https://github.com/jagerjs/jager/blob/master/plugins/jager-newer.js)
- [`uglify`: Uglify javascript](https://github.com/jagerjs/jager/blob/master/plugins/jager-uglify.js)
- [`concat`: Combine source files](https://github.com/jagerjs/jager/blob/master/plugins/jager-concat.js)
- [`rename`: Rename a file](https://github.com/jagerjs/jager/blob/master/plugins/jager-rename.js)
- [`less`: Process less files](https://github.com/jagerjs/jager/blob/master/plugins/jager-less.js)
- [`autoprefixer`: Add vendor prefixes to css](https://github.com/jagerjs/jager/blob/master/plugins/jager-autoprefixer.js)
- [`angular-templates`: Create cache file for all angular templates](https://github.com/jagerjs/jager/blob/master/plugins/jager-angular-templates.js)
- [`ng-annotate`: Create a version of angular-js-file that is uglify save](https://github.com/jagerjs/jager/blob/master/plugins/jager-ng-annotate.js)
- [`bower-src`: Add files from your bower config](https://github.com/jagerjs/jager/blob/master/plugins/jager-bower-src.js)
- [`livereload`: Reloads your browser when files change](https://github.com/jagerjs/jager/blob/master/plugins/jager-livereload.js)
- [`imagemin`: Minify images seamlessly](https://github.com/jagerjs/jager/blob/master/plugins/jager-imagemin.js)
- [`postcss`: Transforming CSS with JS plugins](https://github.com/jagerjs/jager/blob/master/plugins/jager-postcss.js)
- [`extract-sourcemap`: Extract sourcemaps into separate files](https://github.com/jagerjs/jager/blob/master/plugins/jager-extract-sourcemap.js)
- [`modernizr`: Create on the fly modernizr builds](https://github.com/jagerjs/jager/blob/master/plugins/jager-modernizr.js)
- [`clean-css`: Library for minifying CSS files](https://github.com/jagerjs/jager/blob/master/plugins/jager-clean-css.js)
