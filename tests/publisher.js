var redis = require('redis'),
    opts = require('opts'),
    config = require('./config'),
    queue = require('../queue');

opts.parse([
    {
        'short': 'm',
        'long': 'message',
        'description': 'Json message to send',
        'value': true,
        'required': false
    }, {
        'short': 'n',
        'long': 'count',
        'description': 'Count of times to send message',
        'value': true,
        'required': false
    }, {
        'short': 't',
        'long': 'timeout',
        'description': 'Timeout between sends',
        'value': true,
        'required': false
    }
], true);

var message = opts.get('message') || '{"some":"data"}';
var count =  opts.get('count') || 1;
var timeout =  opts.get('timeout') || 1000;

var publisher = queue.getPublisher(config);

function sendMessage(message, count, timeout) {
    publisher.publish('broadcast', message, function() {
        console.log('Message: ' + JSON.stringify(message) + ' sent');

        if (--count > 0) {
            setTimeout(function () {
                sendMessage(message, count, timeout);
            }, timeout);
        } else {
            publisher.disconnect();
        }
    });
}

sendMessage(JSON.parse(message), count, timeout);