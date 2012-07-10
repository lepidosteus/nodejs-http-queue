var httpQueue = require('./http-queue');

// it is also possible for you to add custom data to be sent to the callback

var batch = new httpQueue();

var show_title = function(data, r) {
    var rgxp = /<title>(.+)<\/title>/g;
    var match;
    while ((match = rgxp.exec(data))) {
	console.log('The <title> is: "' + match[1] + '"');
    };
    console.log('Custom data: ' + r.custom_data.somefield);
};

batch.add('nodejs.org', '/', show_title, {somefield: 456});

batch.run();
