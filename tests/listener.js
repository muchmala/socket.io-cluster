var redis = require("redis"),
    config = require('./config'),
    queue = require('../queue');

var listener = queue.getListener(config);

listener.subscribe('broadcast', function(message) {
    console.log('broadcasting message' + JSON.stringify(message) + 'to all');
});

listener.subscribe('connect', function(message) {
    console.log('Connect: ' + JSON.stringify(message) + 'to all');
});

listener.subscribe('disconnect', function(message) {
    console.log('Disconnect: ' + JSON.stringify(message) + 'to all');
});

listener.subscribe('message', function(message) {
    console.log('Message: ' + JSON.stringify(message) + 'to all');
});
