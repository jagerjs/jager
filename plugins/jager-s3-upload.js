
/**
 * Upload files to an S3 bucket
 *
 * Notes:
 * - Files will be uploaded regardless of existing files, make sure you use a new bucket for this
 * - Files that no longer in the chain will be removed
 *
 * **API**: `('s3-upload', options)`
 *
 * - `options`:
 *     - `accessKeyId`: aws access key
 *     - `secretAccessKey`: aws secret key
 *     - `region`: aws region for your s3 bucket
 *     - `bucket`: bucket to upload to
 *     - `base`: gets stripped from URL, for exmaple you would provide the name of your build dir
 *     - `headers`: extra headers for files, ex: `{ 'index.html': { CacheControl: 'no-cache' } }` (in AWS format)
 */

'use strict';

var path = require('path');
var crypto = require('crypto');

var _ = require('lodash');
var async = require('async');
var S3 = require('aws-sdk/clients/s3');
var mimeTypes = require('mime-types');
var minimatch = require('minimatch');

var __root = process.cwd();

function assert(options, cb) {
	if (!options.accessKeyId) {
		cb(new Error('Invalid access key id'));
	}

	if (!options.secretAccessKey) {
		cb(new Error('Invalid secret access key'));
	}

	if (!options.region) {
		cb(new Error('Invalid region'));
	}

	if (!options.bucket) {
		cb(new Error('Invalid bucket name'));
	}

	return true;
}

function getUploadInfo(base, bucket, headersInfo, files) {
	var root = path.join(__root, base || '');

	return files.map(function(file) {
		var relativeFilename = path.relative(root, file.filename());
		var contentType = mimeTypes.contentType(path.extname(file.filename()));
		var params = {
			Bucket: bucket,
			Key: relativeFilename,
			Body: file.buffer(),
		};

		if (contentType) {
			params.ContentType = contentType;
		}

		_.each(headersInfo, function(headers, filenameGlob) {
			if (minimatch(relativeFilename, filenameGlob)) {
				_.each(headers, function(value, name) {
					params[name] = value;
				});
			}
		});

		return {
			etag: '"' + crypto.createHash('md5').update(file.buffer()).digest('hex') + '"',
			params: params,
			file: file,
		};
	});
}

function getClearInfo(client, bucket, uploadInfo, cb) {
	var params = {
		Bucket: bucket,
	};

	var newKeys = uploadInfo.map(function(file) {
		return file.params.Key;
	});

	client.listObjects(params, function(err, data) {
		var keysToDelete = [];

		if (err) {
			cb(err);
		} else {
			data.Contents.forEach(function(remoteFile) {
				if (newKeys.indexOf(remoteFile.Key) === -1) {
					keysToDelete.push({ Key: remoteFile.Key });
				}
			});

			cb(null, keysToDelete);
		}
	});
}

function clearBucket(client, bucket, keysToDelete, cb) {
	if (keysToDelete.length > 0) {
		client.deleteObjects({
			Bucket: bucket,
			Delete: {
				Objects: keysToDelete,
			},
		}, cb);
	} else {
		cb();
	}
}

function upload(client, bucket, file, cb) {
	var headParams = {
		Bucket: bucket,
		Key: file.params.Key,
	};

	client.headObject(headParams, function(err, response) {
		if (err && err.statusCode !== 404) {
			cb(err);
		} else if (response && response.ETag === file.etag) {
			cb(null, file.file);
		} else {
			client.upload(file.params, function(err) {
				if (err) {
					cb(err);
				} else {
					cb(null, file.file);
				}
			});
		}
	});
}

module.exports = function(options) {
	var client = new S3({
		region: options.region,
		credentials: {
			accessKeyId: options.accessKeyId,
			secretAccessKey: options.secretAccessKey,
		},
	});

	var headers = options.headers || {};

	return function(files, cb) {
		if (!assert(options, cb)) {
			return;
		}

		this.log('Uploading to "' + options.bucket + '"...');

		var uploadInfo = getUploadInfo(options.base, options.bucket, headers, files);

		function clearBucketHandler(err) {
			if (err) {
				cb(err);
			} else {
				cb(null, files);
			}
		}

		function uploadHandler(keysToDelete, err) {
			if (err) {
				cb(err);
			} else {
				clearBucket(client, options.bucket, keysToDelete, clearBucketHandler);
			}
		}

		function getClearInfoHandler(err, keysToDelete) {
			if (err) {
				cb(err);
			} else {
				async.map(
					uploadInfo,
					upload.bind(null, client, options.bucket),
					uploadHandler.bind(null, keysToDelete));
			}
		}

		getClearInfo(client, options.bucket, uploadInfo, getClearInfoHandler);
	};
};
