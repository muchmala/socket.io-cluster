exports.client = client;

function client(connection) {
    this.connection = connection;
}

client.prototype.disconnect = function() {
    this.connection.close();
};
