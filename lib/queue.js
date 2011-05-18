var rq = require('rq');

exports.Adapter = Adapter;

function Adapter(config) {
    this.listener = rq.getListener(config);
    this.publisher = rq.getPublisher(config);
}

Adapter.prototype.subscribe = function(channelName, callback) {
    this.listener.subscribe(channelName, callback);
};

Adapter.prototype.publish = function(channelName, message) {
    this.publisher.publish(channelName, message);
};

Adapter.prototype.broadcast = function(channelName, message) {
    self.publisher.broadcast(channelName, message);
};