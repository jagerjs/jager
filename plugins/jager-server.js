
/**
 * Serve files that are currently in the chain
 *
 * Set up a server that serves all files in its chain. When a found
 * can't be found a JSON manifest of all the files in the chain is
 * served
 *
 * _Note: not for production use_
 *
 * **API**: `('server'[, options])`
 *
 * - `options`:
 *     - `port`: port used for the server (defaults to 3000)
 *     - `serveIndex`: serve the index file when if file is not found (defaults to `false`)
 *     - `base`: gets stripped from URL, for exmaple you would provide the name of your build dir
 */

'use strict';

var http = require('http');
var path = require('path');
var url = require('url');
var each = require('lodash/each');

var connect = require('connect');
var mimeTypes = require('mime-types');

var __root = process.cwd();

var DEFAULT_PORT = 3000;

var indexFiles = ['/index.html'];

function _serve(response, file) {
	var contentType = mimeTypes.contentType(path.extname(file.url));

	response.statusCode = 200;
	response.setHeader('Content-Length', file.file.buffer().length);

	if (contentType) {
		response.setHeader('Content-Type', contentType);
	}

	response.end(file.file.buffer());
}

function Server(port, serveIndex, base) {
	this._files = {};
	this._serveIndex = serveIndex;
	this._base = base;

	var app = connect();

	app.use(this._serveFile.bind(this));

	http.createServer(app).listen(port);
}

Server.prototype._serveFile = function(request, response) {
	var files = this._getListOfFiles();
	var found = false;
	var indexFile = null;
	var parsedUrl = url.parse(request.url);

	files.forEach(function(file) {
		if (indexFiles.indexOf(file.url) !== -1) {
			indexFile = file;
		}

		if (parsedUrl.pathname === file.url) {
			found = true;

			_serve(response, file);
		}
	});

	if (!found) {
		if (this._serveIndex && indexFile && !request.url.match(/manifest/)) {
			_serve(response, indexFile);
		} else {
			this._serveListOfFiles(response);
		}
	}
};

Server.prototype._serveListOfFiles = function(response) {
	var files = this._getListOfFiles();
	var content = {
		error: 'Could not find file',
		files: files.map(function(file) { return file.url; }),
	};

	var buffer = new Buffer(JSON.stringify(content, 4));

	response.writeHead(404, {
		'Content-Type': 'text/javascript; charset=UTF-8',
		'Content-Length': buffer.length,
	});

	response.end(buffer);
};

Server.prototype._getListOfFiles = function() {
	var files = [];

	var root = path.join(__root, this._base);

	each(this._files, function(fileList) {
		files = files.concat(fileList.map(function(file) {
			var url = file.isUrl() ? file.filename() : ('/' + path.relative(root, file.filename()));

			return {
				url: url,
				file: file,
			};
		}));
	});

	return files;
};

Server.prototype.setFiles = function setFiles(chainId, files) {
	this._files[chainId] = files;
};

var serverInstances = {};

module.exports = function(rawOptions) {
	var options = rawOptions || {};
	var port = parseInt(options.port || DEFAULT_PORT, 10);
	var serveIndex = !!options.serveIndex;
	var base = options.base || '';

	return function server(files, cb) {
		var chainId = this.getChainId();

		if (!serverInstances[port]) {
			this.log('Starting server on port ' + port);
			serverInstances[port] = new Server(port, serveIndex, base);
		}

		serverInstances[port].setFiles(chainId, files);

		cb(null, files);
	};
};
