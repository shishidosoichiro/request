var util = require('util');
var http = require('http');
var stream = require('stream');
var Duplex = stream.Duplex;

var defaults = {
	direct: false,
	buffer: true
};

function Request(options) {
	if (!(this instanceof Request)) return new Request(options);

	options = Object.assign(defaults, options);
	Duplex.call(this, {objectMode: !options.direct});
	this.options = options;
};
util.inherits(Request, Duplex);

// override 'end' method
var end = Request.prototype.end;
Request.prototype.end = function(){
	this.req.end();
	end.call(this);
};
Request.prototype._write = function(chunk, enc, callback){
	if (!this.req) this._createRequest(this.options);

	this.req.write(chunk);
	callback();
};
Request.prototype._read = function(){};
Request.prototype._createRequest = function(options){
	this.req = http.request(options);
	this.req.on('response', function(res){
		if (this.options.direct) {
			res
			.on('data', function(data){
				this.push(data)
			}.bind(this))
			.on('end', function(data){
				this.push(null)
			}.bind(this));
		}
		else if (this.options.buffer) {
			var buffers = [];
			var length = 0;
			res
			.on('data', function(data){
				buffers.push(data);
				length += data.length;
			}.bind(this))
			.on('end', function(data){
				res.body = Buffer.concat(buffers, length);
				this.push(res)
				this.push(null)
			}.bind(this));
		}
		else {
			this.push(res);
			this.push(null);
		}
	}.bind(this))
};

module.exports = Request;