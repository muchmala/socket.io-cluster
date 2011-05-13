var baseClient = require('./base').client;

exports.client = client;

function client(connection, storageClient) {
    this.connection = connection;
    this.storageClient = storageClient;

    this.client = connection.client;
    var subscriptions = this.subscriptions = {};

    this.client.on("message", function (channelName, message) {
        if (channelName in subscriptions) {
            subscriptions[channelName].call(this, JSON.parse(message));
        }
    });
}

client.prototype.__proto__ = baseClient.prototype;

client.prototype.subscribe = function(channelName, callback) {
    var ownChannelName = this._generateUniqueChannelName(channelName);

    this._subscribe(ownChannelName, callback);
    this.storageClient.getList(channelName).prepend(ownChannelName);

    this._subscribe(channelName, callback);
    return this;
};

client.prototype._subscribe = function(channelName, callback) {
    this.subscriptions[channelName] = callback;
    this.client.subscribe(channelName);
};

client.prototype._generateUniqueChannelName = function(channelName) {
    return channelName + Math.random().toString().substr(2);
};