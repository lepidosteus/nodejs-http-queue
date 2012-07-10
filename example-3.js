var httpQueue = require('./http-queue');

// you can also add urls *while* the queue is running

var batch = new httpQueue();

var show_title = function(data) {
    var rgxp = /<title>(.+)<\/title>/g;
    var match;
    while ((match = rgxp.exec(data))) {
	console.log('The <title> is: "' + match[1] + '"');
    };
};

batch.add('nodejs.org', '/', function(data) {
    show_title(data);
    // add an url from inside one of the callbacks ...
    batch.add('search.npmjs.org', '/', show_title);
});

batch.run();

// ... or from outside of it
batch.add('npmjs.org', '/', show_title);

// when the call to add() is made, the url is pushed in the pool, and started whenever there is some
//  place left in the execution stack.
