var clients = require('./clients');
var connection = require('./connection').connection;

exports.connection = connection;
exports.getPublisher = getPublisher;
exports.getListener = getListener;

function getConnection(configuration) {
    return new connection(
            configuration.REDIS_HOST,
            configuration.REDIS_PORT,
            configuration.REDIS_PASSWORD
        );
}

function getPublisher(configuration) {
    var connection = getConnection(configuration);

    return new clients.publisher(connection);
}

function getListener(configuration) {
    var connection = getConnection(configuration);

    return new clients.listener(connection);
}