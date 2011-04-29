exports.listener = listener;
exports.publisher = publisher;

function listener(connection) {
    this.connection = connection;
    this.client = connection.client;
    var subscriptions = this.subscriptions = {};

    this.client.on("message", function (channel, message) {
        if (channel in subscriptions) {
            subscriptions[channel].call(this, JSON.parse(message));
        }
    });
}

listener.prototype.subscribe = function(channel, callback) {
    this.subscriptions[channel] = callback;
    this.client.subscribe(channel);
};

listener.prototype.disconnect = function() {
    this.connection.close();
};


function publisher(connection) {
    this.connection = connection;
    this.client = connection.client;
}

publisher.prototype.publish = function(channel, message, callback) {
    var args = [channel, JSON.stringify(message)];

    if (typeof callback === "function") {
        args.push(callback);
    }

    this.client.publish.apply(this.client, args);
};

publisher.prototype.disconnect = function() {
    this.connection.close();
};
