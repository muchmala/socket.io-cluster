var rq = require('rq');

exports.adapter = adapter;

function adapter(config) {
    this.listener = rq.getListener(config);
    this.publisher = rq.getPublisher(config);
}

adapter.prototype.subscribe = function(channelName, callback) {
    this.listener.subscribe(channelName, callback);
};

adapter.prototype.publish = function(channelName, message) {
    this.publisher.publish(channelName, message);
};

adapter.prototype.broadcast = function(channelName, message) {
    self.publisher.broadcast(channelName, message);
};