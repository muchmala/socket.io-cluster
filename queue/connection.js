var redis = require("redis");
var clients = require("./clients");

exports.connection = connection;

function connection(host, port, password) {
    this.client = redis.createClient(port, host);

    if (password !== undefined) {
        this.client.auth(password);
    }
}

connection.prototype.close = function() {
    this.client.quit();
};

connection.prototype.getPublisher = function() {
    return new clients.publisher(this);
};

connection.prototype.getListener = function() {
    return new clients.listener(this);
};
