var iocluster = require('..'),
    config = require('./config');

var io = iocluster.getClient(config);
var buffer = [];

io.on('connection', function(client, isReconnect) {
    console.log('Client %s connected', client.sessionId);

    if (!isReconnect) {
        client.send({ buffer: buffer });
        client.broadcast({ announcement: client.sessionId + ' connected' });
    }

    client.on('message', function(message) {
        console.log('Message from client %s: [%o]', client.sessionId, message);

        var msg = { message: [client.sessionId, message] };
        buffer.push(msg);
        if (buffer.length > 15) buffer.shift();
        client.broadcast(msg);
    });

    client.on('disconnect', function() {
        console.log('Client %s disconnected', client.sessionId);

        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
});

