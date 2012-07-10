var httpQueue = require('./http-queue');

// you can decide how many urls should be fetched at one given time, and give a delay
//  between starting new requests (eg; to avoid overloading the servers you are querying
//  or getting blacklisted)

// for exemple here we take example-2 again, only this time we ask for one url at a time,
//  and wait 500 milliseconds between each request

// default is ten concurrent requests and no waiting


var batch = new httpQueue({
    max_concurrent: 1,
    sleep_delay: 500
});

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

batch.run();
