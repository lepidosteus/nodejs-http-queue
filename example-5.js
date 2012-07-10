var httpQueue = require('./http-queue');

// you can register callbacks to 4 events; start/end of batch, start/end of individual url fetching

var batch = new httpQueue();

var show_title = function(data) {
    var rgxp = /<title>(.+)<\/title>/g;
    var match;
    while ((match = rgxp.exec(data))) {
	console.log('The <title> is: "' + match[1] + '"');
    };
};

batch.add('nodejs.org', '/', show_title);
batch.add('search.npmjs.org', '/', show_title);
batch.add('npmjs.org', '/', show_title);

batch.on('batch_start', function(num) {
    console.log('The queue just started being processed (with ' + num + ' items in the pool)');
});

batch.on('batch_end', function() {
    console.log('The queue is done processing');
});

batch.on('request_start', function(r, req) {
    // r is our internal request options
    // req is the corresponding http.ClientRequest object
    console.log('A new request started for ' + r.options.host);
});

batch.on('request_end', function(data, r, res) {
    // data is the content of the url fetched
    // res is the corresponding http.ClientRequest object
    // r is our internal request options
    console.log('The request is done processing ' + r.options.host + ', content weights ' + data.length + " bytes");
});

batch.run();
