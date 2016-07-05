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

- [`src`: Add source files](#src-add-source-files)
- [`dest`: Write files](#dest-write-files)
- [`browserify`: Process a file with browserify](#browserify-process-a-file-with-browserify)
- [`newer`: Filter old files out of the chain](#newer-filter-old-files-out-of-the-chain)
- [`uglify`: Uglify javascript](#uglify-uglify-javascript)
- [`concat`: Combine source files](#concat-combine-source-files)
- [`rename`: Rename a file](#rename-rename-a-file)
- [`less`: Process less files](#less-process-less-files)
- [`autoprefixer`: Add vendor prefixes to css](#autoprefixer-add-vendor-prefixes-to-css)
- [`angular-templates`: Create cache file for all angular templates](#angular-templates-create-cache-file-for-all-angular-templates)
- [`ng-annotate`: Create a version of angular-js-file that is uglify save](#ng-annotate-create-a-version-of-angular-js-file-that-is-uglify-save)
- [`bower-src`: Add files from your bower config](#bower-src-add-files-from-your-bower-config)
- [`livereload`: Reloads your browser when files change](#livereload-reloads-your-browser-when-files-change)
- [`imagemin`: Minify images seamlessly](#imagemin-minify-images-seamlessly)
- [`postcss`: Transforming CSS with JS plugins](#postcss-transforming-css-with-js-plugins)
- [`extract-sourcemap`: Extract sourcemaps into separate files](#extract-sourcemap-extract-sourcemaps-into-separate-files)
- [`modernizr`: Create on the fly modernizr builds](#modernizr-create-on-the-fly-modernizr-builds)
- [`clean-css`: Library for minifying CSS files](#clean-css-library-for-minifying-css-files)

### `src`: Add source files

Add files to the chain used for processing

**API**: `('src', pattern[, options])`

- `pattern`: a glob to find files
- `options`:
	- `dependencies`: a glob to describe dependencies of this source, is used to trigger the rerun when a file is changed (default: `null`)

### `dest`: Write files

Write files in the chain to a given destination. By default only files with a newer `mtime` are written.

**API**: `('dest', dir[, options])`

- `dir`: the directory to which the files in the chain are written, if the directory does not exist, it's created
- `options`:
	- `checkContents`: Check for the contents of the new file location, if the contents is the same, the file is not written (default: `false`)

### `browserify`: Process a file with browserify

Browserify lets you `require('modules')` in the browser by bundling up all of your dependencies. When watch mode is active `watchify` is used to produces faster builds.

**API**: `('browserify'[, options])`

- `options`:
	- See the [browserify options] for details
	- Extra options:
		- `babel`: When set the babel transform is used, see [babel options] for more options, when `true` is supplied the `es2015` and `react` preset are used.
		- `sourceMap`: These options are in line with the options used in the [less options] (currently only `sourceMapBasepath` is supported)

[browserify options]: https://github.com/substack/node-browserify#var-b--browserifyfiles-or-opts
[babel options]: http://babeljs.io/docs/usage/options/
[less options]: http://lesscss.org/usage/#programmatic-usage

### `newer`: Filter old files out of the chain

**API**: `('newer', target[, options])`

- `target`: The target to which you want to compare the files in the chain
- `options`:
	- `basePath`: Common base path between target and source files (default: `cwd`)
	- `checkContents`: Check for the contents of the new file location, if the contents is the same, the file is filteredwritten (default: `false`)

### `uglify`: Uglify javascript

Compress javascript files

**API**: `('uglify')`

### `concat`: Combine source files

Combine all files in the chain into a new file

**API**: `('concat', filename)`

- `filename`: The filename for the new file

### `rename`: Rename a file

Rename the first file in the chain, if it doesn't exist, an empty file is added to the chain

**API**: `('rename', filename)`

- `filename`: the new filename. The following replacements will be done in the filename:
	- `[timestamp]`: the current timestamp is included
	- `[hash]`: the md5 checksum of the contents is included

### `less`: Process less files

Process less file into css files

**API**: `('less'[, options])`

- `options`: See [less options] for all the available options

[less options]: http://lesscss.org/usage/#programmatic-usage

### `autoprefixer`: Add vendor prefixes to css

Plugin to parse CSS and add vendor prefixes to CSS rules using values from [Can I Use]. It is [recommended] by Google and used in Twitter, and Taobao.

[Can I Use]: http://caniuse.com/
[recommended]: https://developers.google.com/web/fundamentals/tools/build/setupbuildprocess#dont-trip-up-with-vendor-prefixes

**API**: `('autoprefixer'[, browserVersions])`

- `browserVersions`: [List of browser you wan to support]

[List of browser you wan to support]: https://github.com/postcss/autoprefixer/blob/master/README.md#browsers

### `angular-templates`: Create cache file for all angular templates

Instead of loading all template files through ajax, include this cache file to make the lookup to these template files instant

**API**: `('angular-templates'[, options])`

- `options`:
	- `base`: Use this to cut a part from the filenames in the cache file, to make it correspond with your template definitions (default: `''`)
	- `filename`: filename of the output file (default: `templates.js`)

### `ng-annotate`: Create a version of angular-js-file that is uglify save

Create an properly annotated version of a angular file with [ng-annotate].

**API**: `('ng-annotate')`

[ng-annotate]: https://github.com/olov/ng-annotate

### `bower-src`: Add files from your bower config

Recursively add the main files from your bower config to your chain.

**API**: `('bower', pattern)`

- `pattern`: glob to match the wanted bower package, ex: `'jquery'` would add the main file for jquery

### `livereload`: Reloads your browser when files change

Notify the browser of any changes in your chain, compatible with at least the [Chrome plugin] and [Firefox plugin].

**API**: `('livereload'[, options])`

- `options`:
	- `port`: port used by the livereload server (default: `35729`)

[Chrome plugin]: https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
[Firefox plugin]: https://addons.mozilla.org/en-us/firefox/addon/livereload/

### `imagemin`: Minify images seamlessly

Minifies all images (based on extension) in the chain with [imagemin].

**API**: `('imagemin'[, options])`

- `options`:
	- `gif`: See [gifsicle options] for more information
	- `jpegtran`: See [jpegtran options] for more information
	- `optipng`: See [optipng options] for more information
	- `svgo`: See [svgo options] for more information

[imagemin]: https://github.com/imagemin/imagemin
[gifsicle options]: https://github.com/imagemin/imagemin-gifsicle
[jpegtran options]: https://github.com/imagemin/imagemin-jpegtran
[optipng options]: https://github.com/imagemin/imagemin-optipng
[svgo options]: https://github.com/imagemin/imagemin-svgo

### `postcss`: Transforming CSS with JS plugins

[PostCSS] is a tool for transforming CSS with JS plugins. These plugins can support variables and mixins, transpile future CSS syntax, inline images, and more.

**API**: `('postcss'[, options])`

- `options`:
	- `plugins`: Plugins used by [PostCSS], see [PostCSS plugin options]

[PostCSS]: https://github.com/postcss/postcss
[PostCSS plugin options]: https://github.com/postcss/postcss#usage

### `extract-sourcemap`: Extract sourcemaps into separate files

**API**: `('extract-sourcemap')`

Creates a file in the same directory as the input file, with a `.map` suffix. The sourcemap in the file is replace with a comment referencing the new file.

### `modernizr`: Create on the fly modernizr builds

**API**: `('modernizr'[, options])`

- `options`: see the [modernizr options] for all available options

[modernizr options]: https://github.com/Modernizr/Modernizr/blob/master/lib/config-all.json

### `clean-css`: Library for minifying CSS files

Clean-css is a fast and efficient Node.js library for minifying CSS files. According to [tests] it is one of the best available.

**API**: `('clean-css'[, options])`

- `options`: see the [clean-css options] for all available options

[tests]: http://goalsmashers.github.io/css-minification-benchmark/
[clean-css options]: https://github.com/jakubpawlowicz/clean-css
