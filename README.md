# Jager (far from finished — fff)

> **DIY is a lifestyle**  
> _— me, builder of yet another build tool_

## Example
```js
var jager = require('jager');

var livereload = jager.create()
	('livereload');

var js = jager.create()
	('src', 'jagerfile.js')
	('uglify')
	('rename', 'renamed-jagerfile.js')
	('dest', '.');

jager.task('js', js);
jager.task('watch:js', { watch: true },  js, livereload);

var less = jager.create()
	('src', 'main.less', { dependencies: '*.less' })
	('less')
	('rename', 'main.css')
	('autoprefixer')
	('dest', '.');

jager.task('less', less);
jager.task('watch:less', { watch: true }, less, livereload);

jager.task('watch', { watch: true }, [js, less], livereload);
```

## Built-in helpers

* `src`: Add source files
* `uglify`: Uglify javascript
* `concat`: Combine source files
* `rename`: Rename the first source file
* `dest`: Copy source files
* `less`: Process less files
* `autoprefixer`: Process css files with autoprefixer
* `angular-templates`: Create a js-file with all a template cache
* `ngmin`: Create a version of angular-js-file that is uglify save
* `bower-src`: Add files from your bower config
* `livereload`: Reloads your browser when files change

## TODO

* better growl
* promises
* plato
* command line options
* pull plugins out of repo
