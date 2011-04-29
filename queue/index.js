var clients = require('./clients');
var connection = require('./connection').connection;

exports.connection = connection;
exports.getConnection = getConnection;

function getConnection(configuration) {
    return new connection(
            configuration.REDIS_HOST,
            configuration.REDIS_PORT,
            configuration.REDIS_PASSWORD
        );
}
