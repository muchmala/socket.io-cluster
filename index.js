exports.listen = listen;

function listen(server, config) {
    var listener = queue.getListener(config);
    var publisher = queue.getPublisher(config);

    var io = io.listen(server);

    io.on('connection', function(client) {
        listener.subscribe('broadcast', function(message) {
            io.broadcast(message);
        });

        client.on('message', function(message) {
            publisher.publish('message', {message: message, client: client.sessionId});
        });

        client.on('disconnect', function() {
            publisher.publish('disconnect', {client: client.sessionId});
        });

        publisher.publish('connect', {client: client.sessionId});
    });
}