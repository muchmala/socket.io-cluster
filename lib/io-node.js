var EventEmitter = require('events').EventEmitter,
    queue = require('../queue'),
    CHANNELS = require('./channels');

exports.listener = listener;

function listener(socketIo, config) {
    this.publisher = queue.getPublisher(config);
    this.socketIo = socketIo;
    var runner = new commandRunner(socketIo);
    var that = this;

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

    runner.on('command', function(context, method, args) {
        if (context !== undefined) {
            that.emit.apply(that, [method, context].concat(args));
        }
    });
}

listener.prototype.__proto__ = EventEmitter.prototype;

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
    this.on('command', function(context, method, args) {
        if (context !== undefined && typeof(context[method]) == 'function') {
            context[method].apply(context, args);
        }
    });
}

commandRunner.prototype.__proto__ = EventEmitter.prototype;

commandRunner.prototype.getCallback = function() {
    var that = this;

    return function (command) {
        that.emit('command', that.getContext(command.context), command.method, command.args);
    }
};

commandRunner.prototype.getContext = function (context) {
    if (context != 'listener') {
        return this.socketIo.clients[context];
    }

    return this.socketIo;
};
