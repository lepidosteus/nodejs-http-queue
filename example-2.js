var httpQueue = require('./http-queue');

// you can add several urls to the pool before starting
//  note that the order they will be printed is not the order in which we add them,
//  but the one in which we retrieve them (if the 4th url in the pool loads before the
//  1st, we process it right away)

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
// you can add several paths at once
batch.add('npmjs.org', ['/', '/doc/adduser.html'], show_title);

batch.run();
