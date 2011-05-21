var appNode = require('./app-node'),
    ioNode = require('./io-node'),
    frontendNode = require('./frontend-node'),
    io = require('socket.io');

exports.makeAppServer = makeAppServer;
exports.makeListener = makeListener;

exports.makeIoServer = makeIoServer;
exports.makeIoListener = makeIoListener;

exports.makeFrontendServer = makeFrontendServer;

exports.frontendServer = frontendNode.Server;
exports.appServer = appNode.Server;
exports.ioServer = ioNode.Server;
exports.ioEventsHandler = ioNode.EventHandler;


function makeAppServer(config) {
    return new appNode.Server(config);
}

function makeListener(config) {
    var appServer = makeAppServer(config);

    return new appNode.SocketIoAdapter(appServer);
}


function makeIoServer(socketIo, config) {
    return new ioNode.Server(socketIo, config);
}

function makeIoListener(server, config) {
    var socketIo = io.listen(server);
    var ioServer = makeIoServer(socketIo, config);

    return new ioNode.EventHandler(ioServer);
}


function makeFrontendServer(server, config) {
    return new frontendNode.Server(server, config);
}
