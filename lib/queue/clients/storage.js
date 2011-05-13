var baseClient = require('./base').client;
exports.client = client;

function client(connection) {
    this.connection = connection;
    this.client = connection.client;
}

client.prototype.__proto__ = baseClient.prototype;

client.prototype.getList = function(listName) {
    return new list(this.connection, listName);
};

function list(connection, listName) {
    this.connection = connection;
    this.client = connection.client;

    this.listName = listName;
}

list.prototype.__proto__ = baseClient.prototype;

list.prototype.append = function(value, callback) {
    this.client.rpush(this.listName, value, callback);
};

list.prototype.prepend = function(value, callback) {
    this.client.lpush(this.listName, value, callback);
};

list.prototype.popFirst = function(callback) {
    this.client.lpop(this.listName, callback);
};

list.prototype.popLast = function(callback) {
    this.client.rpop(this.listName, callback);
};

list.prototype.popAndPrepend = function(callback) {
    this.client.rpoplpush(this.listName, callback);
};

list.prototype.removeValue = function(value, callback) {
    this.client.lrem(this.listName, 0, value, callback);
};
