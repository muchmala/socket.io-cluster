var redis = require("redis"),
    config = require('./config'),
    queue = require('../queue');

var mqConnection = queue.getConnection(config);
var listener = mqConnection.getListener();

listener.subscribe('broadcast', function(message) {
    console.log('broadcasting message' + JSON.stringify(message) + 'to all');
});
