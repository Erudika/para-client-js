/*
 * Copyright 2013 Michael Hart (michael.hart.au@gmail.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

var url = require('url');
var querystring = require('querystring');
var crypto = require('crypto');
var lru = require('lru-cache');
var credentialsCache = lru(1000);

module.exports = AWS4Signer;

// http://docs.amazonwebservices.com/general/latest/gr/signature-version-4.html

function hmac(key, string, encoding) {
	return crypto.createHmac('sha256', key).update(string, 'utf8').digest(encoding);
}

function hash(string, encoding) {
	return crypto.createHash('sha256').update(string, 'utf8').digest(encoding);
}

// request: { path | body, [host], [method], [headers], [service], [region] }
// credentials: { accessKeyId, secretAccessKey, [sessionToken] }
function AWS4Signer(request, credentials) {
	if (typeof request === 'string') {
		request = url.parse(request);
	}

	var headers = request.headers = (request.headers || {});
	var hostParts = this.matchHost(request.hostname || request.host || headers.Host || headers.host);

	this.request = request;
	this.credentials = credentials || this.defaultCredentials();

	this.service = request.service || hostParts[0] || '';
	this.region = request.region || hostParts[1] || 'us-east-1';

	// SES uses a different domain from the service name
	if (this.service === 'email') {
		this.service = 'ses';
	}

	if (!request.method && request.body) {
		request.method = 'POST';
	}

	if (!headers.Host && !headers.host) {
		headers.Host = request.hostname || request.host || this.createHost();
	}
	if (!request.hostname && !request.host) {
		request.hostname = headers.Host || headers.host;
	}
}

AWS4Signer.prototype.matchHost = function (host) {
	var match = (host || '').match(/^([^\.]+)\.?([^\.]*)\.amazonaws\.com$/);
	return (match || []).slice(1, 3);
};

// http://docs.aws.amazon.com/general/latest/gr/rande.html
AWS4Signer.prototype.isSingleRegion = function () {
	// Special case for S3 and SimpleDB in us-east-1
	if (['s3', 'sdb'].indexOf(this.service) >= 0 && this.region === 'us-east-1') {
		return true;
	}
	return ['cloudfront', 'ls', 'route53', 'iam', 'importexport', 'sts'].indexOf(this.service) >= 0;
};

AWS4Signer.prototype.createHost = function () {
	var region = this.isSingleRegion() ? '' :
			(this.service === 's3' && this.region !== 'us-east-1' ? '-' : '.') + this.region;
	var  service = this.service === 'ses' ? 'email' : this.service;
	return service + region + '.amazonaws.com';
};

AWS4Signer.prototype.sign = function () {
	var request = this.request;
	var headers = request.headers;
	var parsedUrl;
	var query;

	if (request.signQuery) {
		parsedUrl = url.parse(request.path || '/', true);
		query = parsedUrl.query;

		if (this.credentials.sessionToken) {
			query['X-Amz-Security-Token'] = this.credentials.sessionToken;
		}

		if (this.service === 's3' && !query['X-Amz-Expires']) {
			query['X-Amz-Expires'] = 86400;
		}

		if (query['X-Amz-Date']) {
			this.datetime = query['X-Amz-Date'];
		} else {
			query['X-Amz-Date'] = this.getDateTime();
		}

		query['X-Amz-Algorithm'] = 'AWS4-HMAC-SHA256';
		query['X-Amz-Credential'] = this.credentials.accessKeyId + '/' + this.credentialString();
		query['X-Amz-SignedHeaders'] = this.signedHeaders();

		delete parsedUrl.search;
		request.path = url.format(parsedUrl);

		request.path += '&X-Amz-Signature=' + this.signature();
	} else {
		if (!request.doNotModifyHeaders) {
			if (request.body && !headers['Content-Type'] && !headers['content-type']) {
				headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
			}

			if (request.body && !headers['Content-Length'] && !headers['content-length']) {
				headers['Content-Length'] = Buffer.byteLength(request.body);
			}

			if (this.credentials.sessionToken) {
				headers['X-Amz-Security-Token'] = this.credentials.sessionToken;
			}

			if (this.service === 's3') {
				headers['X-Amz-Content-Sha256'] = hash(this.request.body || '', 'hex');
			}

			if (headers['X-Amz-Date']) {
				this.datetime = headers['X-Amz-Date'];
			} else {
				headers['X-Amz-Date'] = this.getDateTime();
			}
		}

		delete headers.Authorization;
		delete headers.authorization;
		headers.Authorization = this.authHeader();
	}
	return request;
};

AWS4Signer.prototype.getDateTime = function () {
	if (!this.datetime) {
		var headers = this.request.headers;
		var date = new Date(headers.Date || headers.date || new Date());
		this.datetime = date.toISOString().replace(/[:\-]|\.\d{3}/g, '');
	}
	return this.datetime;
};

AWS4Signer.prototype.getDate = function () {
	return this.getDateTime().substr(0, 8);
};

AWS4Signer.prototype.authHeader = function () {
	return [
		'AWS4-HMAC-SHA256 Credential=' + this.credentials.accessKeyId + '/' + this.credentialString(),
		'SignedHeaders=' + this.signedHeaders(),
		'Signature=' + this.signature()
	].join(', ');
};

AWS4Signer.prototype.signature = function () {
	var date = this.getDate();
	var cacheKey = [this.credentials.secretAccessKey, date, this.region, this.service].join();
	var kDate;
	var kRegion;
	var kService;
	var kCredentials = credentialsCache.get(cacheKey);

	if (!kCredentials) {
		kDate = hmac('AWS4' + this.credentials.secretAccessKey, date);
		kRegion = hmac(kDate, this.region);
		kService = hmac(kRegion, this.service);
		kCredentials = hmac(kService, 'aws4_request');
		credentialsCache.set(cacheKey, kCredentials);
	}
	return hmac(kCredentials, this.stringToSign(), 'hex');
};

AWS4Signer.prototype.stringToSign = function () {
	return [
		'AWS4-HMAC-SHA256',
		this.getDateTime(),
		this.credentialString(),
		hash(this.canonicalString(), 'hex')
	].join('\n');
};

AWS4Signer.prototype.canonicalString = function () {
	var pathStr = this.request.path || '/';
	var queryIx = pathStr.indexOf('?');
	var queryStr = '';
	var bodyHash = this.service === 's3' && this.request.signQuery ?
			'UNSIGNED-PAYLOAD' : hash(this.request.body || '', 'hex');
	if (queryIx >= 0) {
		var query = querystring.parse(pathStr.slice(queryIx + 1));
		pathStr = pathStr.slice(0, queryIx);
		queryStr = querystring.stringify(Object.keys(query).sort().reduce(function (obj, key) {
			obj[key] = Array.isArray(query[key]) ? query[key].sort() : query[key];
			return obj;
		}, {})).replace(/[!'()*]/g, function (c) {
			return '%' + c.charCodeAt(0).toString(16).toUpperCase();
		});
	}
	return [
		this.request.method || 'GET',
		url.resolve('/', pathStr.replace(/\/{2,}/g, '/')) || '/',
		queryStr,
		this.canonicalHeaders() + '\n',
		this.signedHeaders(),
		bodyHash
	].join('\n');
};

AWS4Signer.prototype.canonicalHeaders = function () {
	var headers = this.request.headers;
	function trimAll(header) {
		return header.toString().trim().replace(/\s+/g, ' ');
	}
	return Object.keys(headers)
			.sort(function (a, b) {
				return a.toLowerCase() < b.toLowerCase() ? -1 : 1;
			})
			.map(function (key) {
				return key.toLowerCase() + ':' + trimAll(headers[key]);
			})
			.join('\n');
};

AWS4Signer.prototype.signedHeaders = function () {
	return Object.keys(this.request.headers)
			.map(function (key) {
				return key.toLowerCase();
			})
			.sort()
			.join(';');
};

AWS4Signer.prototype.credentialString = function () {
	return [
		this.getDate(),
		this.region,
		this.service,
		'aws4_request'
	].join('/');
};

AWS4Signer.prototype.defaultCredentials = function () {
	var env = process.env;
	return {
		accessKeyId: env.AWS_ACCESS_KEY_ID || env.AWS_ACCESS_KEY,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY || env.AWS_SECRET_KEY,
		sessionToken: env.AWS_SESSION_TOKEN
	};
};

AWS4Signer.sign = function (request, credentials) {
	return new AWS4Signer(request, credentials).sign();
};
