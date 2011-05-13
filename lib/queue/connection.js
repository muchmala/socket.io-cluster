var redis = require("redis");

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
