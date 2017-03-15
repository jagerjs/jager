
/* eslint-disable no-spaced-func */

var path = require('path');

var jager = require('./../jager');

var __root = process.cwd();

// setup a pug file chain
// assumes the files are in the base path + pages directory
function pugChain(basePath, outputDir) {
	return jager.create()
		('src', basePath + '/pages/**/*.pug', { dependencies: basePath + '/**/*.pug' })
		('pug', {
			basedir: basePath,
		})
		('rename', '[basename].html')
		('dest', outputDir);
}

// setup a html file chain
// assumes the files are in the base path + pages directory
function htmlChain(basePath, outputDir) {
	return jager.create()
		('src', basePath + '/pages/**/*.html', { dependencies: basePath + '/**/*.html' })
		('rename', '[filename]')
		('dest', outputDir);
}

// setup a assets chain
// basically a file copy a couple of images
function assetsChain(basePath, outputDir) {
	return jager.create()
		('src', basePath + '/**/{*.png,*.jpg,*.svg,*.gif,*.pdf,*.ico}')
		('imagemin')
		('rename', '[dirname]/[basename]-[hash][extension]')
		('src', basePath + '/favicon.ico')
		('dest', outputDir, { basePath: basePath });
}

// setup a less file chain
// base path + index.less
function lessChain(basePath, outputDir) {
	var entry = path.join(basePath, 'index.less');

	return jager.create()
		('src', entry, { dependencies: basePath + '/**/*.less' })
		('less', {
			sourceMap: {
				sourceMapBasepath: path.basename(basePath), // gets stripped from the source map sources
				sourceMapFileInline: true,
				outputSourceFiles: true,
			},
			relativeUrls: true,
			basePath: basePath,
		})
		('rename', '[basename]-[hash].css')
		('autoprefixer')
		('clean-css')
		('dest', outputDir);
}

// setup a javascript file chain with rollup
// base path + index.js
function javascriptChain(basePath, outputDir) {
	var entry = path.join(basePath, 'index.js');

	return jager.create()
		('src', entry)
		('rollup')
		('env', {
			NODE_ENV: process.env.NODE_ENV || 'development',
		})
		('uglify')
		('rename', '[basename]-[hash].js')
		('dest', outputDir);
}

// setup a s3 deploy chain
// uses a couple environment variables
function deployChain(base) {
	return jager.create()
		('s3-upload', {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			region: process.env.S3_REGION,
			bucket: process.env.S3_BUCKET,
			base: base,
			headers: {
				// disable caching for the html files, otherwise it will take a
				// long time before S3/Cloudfront see the updated html files
				'**/*.html': {
					CacheControl: 'no-cache',
				},
			},
		});
}

// setup a server chain with livereload
// livereload runs on port + 1
function serverChain(port, base) {
	return jager.create()
		('server', {
			port: port,
			serveIndex: true,
			base: base,
		})
		('livereload', {
			injectScriptLocation: true,
			port: port + 1,
		});
}

// setup a inject chain
function injectChain(base) {
	return jager.create()
		('inject', '**/{*.html,*.css}', {
			base: base,
			srcBase: 'src',
		});
}

module.exports = function staticWebsite(rawOptions) {
	var options = rawOptions || {};
	var port = parseInt(process.env.PORT || options.port, 10) || 3000;
	var srcPath = options.srcPath || 'src';
	var basePath = path.join(__root, srcPath);
	var buildPath = options.buildPath || 'build';
	var outputDir = path.join(__root, buildPath);
	var base = buildPath;

	var chains = [
		htmlChain(basePath, outputDir),
		pugChain(basePath, outputDir),
		assetsChain(basePath, outputDir),
		lessChain(basePath, outputDir),
		javascriptChain(basePath, outputDir),
	];

	var inject = injectChain(base);
	var server = serverChain(port, base);

	if (options.deploy) {
		jager.task('static-website', chains, inject, deployChain(base));
	} else {
		jager.task('static-website', chains, inject);
	}

	jager.task('static-website:watch', { watch: true }, chains, server, inject);
};
