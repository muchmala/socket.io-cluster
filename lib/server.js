var queue = require('../queue'),
    CHANNELS = require('./channels');

exports.listener = listener;

function listener(socketIo, config) {
    this.publisher = queue.getPublisher(config);
    var that = this;
    var runner = new commandRunner(socketIo);

    queue.getListener(config).subscribe(CHANNELS.outgoing, runner.getCallback());

    socketIo.on('connection', function(client) {
        client.on('message', function(data) {
            that.sendMessage('message', client, data);
        });

        client.on('disconnect', function() {
            that.sendMessage('disconnect', client);
        });

        that.sendMessage('connection', client);
    });
}

listener.prototype.sendMessage = function(type, client, data) {
    this.publisher.publish(CHANNELS.incoming, createMessage(type, client, data));
}

function createMessage (type, client, data) {
    return {
        type: type,
        client: client.sessionId,
        data: data
    };
}

function commandRunner(socketIo) {
    this.socketIo = socketIo;
}

commandRunner.prototype.getCallback = function() {
    var that = this;

    return function (command) {
        var context = that.getContext(command.context);

        if (context !== undefined) {
            context[command.method].apply(context, command.args);
        }
    }
};

commandRunner.prototype.getContext = function (context) {
    if (context != 'listener') {
        return this.socketIo.clients[context];
    }

    return this.socketIo;
};
