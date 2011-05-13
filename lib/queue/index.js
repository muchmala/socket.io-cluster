var clients = require('./clients');
var connection = require('./connection').connection;

exports.connection = connection;
exports.clients = clients;
exports.getPublisher = getPublisher;
exports.getListener = getListener;
exports.getStorageClient = getStorageClient;

function getConnection(configuration) {
    return new connection(
            configuration.REDIS_HOST,
            configuration.REDIS_PORT,
            configuration.REDIS_PASSWORD
        );
}

function getPublisher(configuration) {
    var connection = getConnection(configuration);

    return new clients.publisher(connection, getStorageClient(configuration));
}

function getListener(configuration) {
    var connection = getConnection(configuration);

    return new clients.listener(connection, getStorageClient(configuration));
}

function getStorageClient(configuration) {
    var connection = getConnection(configuration);

    return new clients.storage(connection);
}
