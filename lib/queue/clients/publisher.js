var baseClient = require('./base').client;

exports.client = client;


function client(connection, storageClient) {
    this.connection = connection;
    this.storageClient = storageClient;

    this.client = connection.client;
}

client.prototype.__proto__ = baseClient.prototype;

client.prototype.publish = function(channelNamespace, message, callback) {
    var list = this.storageClient.getList(channelNamespace);

    this._tryNextChannel(list, message, callback);
    return this;
};

client.prototype.broadcast = function(channelName, message, callback) {
    this._publish(channelName, message, callback);
    return this;
};

client.prototype._tryNextChannel = function(list, message, callback) {
    var self = this;

    list.popAndPrepend(function(channelName) {
        this._publish(channelName, message, function (countOfRecipients) {
            if (countOfRecipients < 1) {
                list.removeValue(channelName);
                self._tryNextChannel(channelName, message, callback);
            } else {
                callback.call();
            }
        });

    });
};

client.prototype._publish = function(channel, message, callback) {
    var args = [channel, JSON.stringify(message)];

    if (typeof callback === "function") {
        args.push(callback);
    }

    this.client.publish.apply(this.client, args);
};
