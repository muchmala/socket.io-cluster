var io = require('socket.io'),
    listener = require('./lib/server').listener,
    clientListener = require('./lib/client').listener;

exports.listen = listen;
exports.getClient = getClient;

function listen(server, config) {
    var socketIo = io.listen(server);
    new listener(socketIo, config);

    return socketIo;
}

function getClient(config) {
    return new clientListener(config);
}