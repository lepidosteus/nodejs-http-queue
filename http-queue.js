var http = require('http');
var util = require('util');
var events = require('events');

module.exports = function(options) {
    // our pool of urls to process
    this._pool = [];
    // active marker, where are we in the pool
    this._position = 0;
    // how many are currently processing
    this._running = 0;

    this._options = {
	// how many url to process in parallel
	max_concurrent: 10,
	// how much time (in millisecond) to wait after finishing an url before starting to process another one
	sleep_delay: 0
    }

    // if an option array was given, extend our internal settings with it
    if (options && options.constructor == Object) {
	for (i in this._options) {
	    if (options[i]) {
		this._options[i] = options[i];
	    }
	}
    }

    // allows to flush old / processed url in the pool for a long running process. Will be called automatically after a queue
    this.compact = function() {
	this._pool = this._pool.slice(this._position);
	this._position = 0;
    };

    // add an url to the pool
    this.add = function(req_host, req_paths, req_end_callback, req_custom_data, req_options) {
	var options = {
	    port: 80,
	    method: 'GET',
	    host: req_host
	};

	for (i in req_options) {
	    if (req_options.hasOwnProperty(i)) {
		options[i] = req_options[i];
	    }
	}

	if (typeof req_paths != 'object') {
	    req_paths = [req_paths];
	}

	for (var i in req_paths) {
	    if (req_paths.hasOwnProperty(i)) {
		var suboptions = {};

		for (var j in options) {
		    if (options.hasOwnProperty(j)) {
			suboptions[j] = options[j];
		    }
		}

		suboptions.path = req_paths[i];
		this._pool.push({
		    options: suboptions,
		    end_callback: req_end_callback,
		    custom_data: req_custom_data
		});
	    }
	}
    };

    // internal function, advance the position marker one spot and start processing the url found if any
    this._execute = function() {
	var r = this._pool[this._position];

	if (this._running >= this._options.max_concurrent) {
	    return false;
	}

	if (typeof r != 'object') {
	    if (this._position != 0) {
		this.compact();
	    }
	    return false;
	}

	this._position++;

	var self = this;

	var req = http.request(r.options, function(res) {
	    var data = '';
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
		data = data += chunk;
	    });
	    res.on('end', function () {
		self.emit('request_end', data, r, res);

		if (r.end_callback) {
		    r.end_callback(data, r, res);
		}

		self._running--;

		setTimeout(function() {
		    self._execute();

		    if (self._running == 0) {
			self.emit('batch_end');
		    }
		}, self._options.sleep_delay);
	    });
	});
	req.end();

	self._running++;
	self.emit('request_start', r, req);

	return true;
    };

    // start the queue
    this.run = function () {
	if (this._running > 0) {
	    return false;
	}

	this.emit('batch_start', this._pool.length);

	var timer;
	var self = this;

	timer = setInterval(function() {
	    if (!self._execute()) {
		clearInterval(timer);
	    }
	}, self._options.sleep_delay);

	return true;
    };
}

util.inherits(module.exports, events.EventEmitter);
