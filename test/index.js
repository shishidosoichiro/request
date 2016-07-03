'use strict';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();
var express = require('express')
var bodyParser = require('body-parser');
var es = require('event-stream');

var request = require('../');

describe('request', function(){
	var server;

	before(function(){
		server  = express()
		.use(bodyParser.text({ type: 'text/plain' }))
		.post('/api/echo', function(req, res){
			res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
			res.send(req.body);
		})
		.listen(3000);
	});
	var defaults = {
		host: 'localhost',
		port: 3000,
		path: '/api/echo',
		method: 'post',
		headers: {
			'Content-Type': 'text/plain; charset=UTF-8'
		}
	};
	it('should return writable of response, if options.direct is false.', function(done){
		var options = Object.assign(defaults, {direct: false, buffer: false});
		es.readArray(['text1'])
		.pipe(request(options))
		.pipe(es.map(function(res){
			res.statusCode.should.equal(200)
			res.setEncoding('utf8')
			.on('data', function(data){
				data.should.equal('text1');
			})
			.on('error', done)
			.on('end', done)
		}))
	});
	it('should return writable of response, if options.buffer is true.', function(done){
		var options = Object.assign(defaults, {direct: false, buffer: true});
		es.readArray(['text1'])
		.pipe(request(options))
		.pipe(es.map(function(res){
			res.statusCode.should.equal(200)
			res.body.toString().should.equal('text1');
			done();
		}))
	});
	it('should return writable of response body, if options.direct is true.', function(done){
		var options = Object.assign(defaults, {direct: true});
		es.readArray(['text1'])
		.pipe(request(options))
		.pipe(es.map(function(data){
			data.toString().should.equal('text1');
			done()
		}))
	});
	it('should send request successfully, if body is nothing.', function(done){
		var options = Object.assign(defaults, {direct: false, buffer: false});
		es.readArray([])
		.pipe(request(options))
		.pipe(es.map(function(res){
			res.statusCode.should.equal(200)
			res.setEncoding('utf8')
			.on('data', function(data){
				done('error')
			})
			.on('error', done)
			.on('end', done)
		}))
	});
})
