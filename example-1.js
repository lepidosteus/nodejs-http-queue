var httpQueue = require('./http-queue');

// simplest exemple; add a page to our pool, and print its title

var batch = new httpQueue();

batch.add('nodejs.org', '/', function(data) {
    var rgxp = /<title>(.+)<\/title>/g;
    var match;
    while ((match = rgxp.exec(data))) {
	console.log('The <title> is: "' + match[1] + '"');
    };
});

batch.run();
