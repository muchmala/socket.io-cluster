var redis = require("redis"),
    config = require('./config'),
    queue = require('../queue');

var listener = queue.getListener(config);

listener.subscribe('broadcast', function(message) {
    console.log('broadcasting message' + JSON.stringify(message) + 'to all');
});
