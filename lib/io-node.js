var EventEmitter = require('events').EventEmitter,
    queue = require('./queue');

exports.Server = Server;
exports.EventHandler = EventHandler;

function Server(socketIo, config) {
    var self = this;

    this.queue = new queue.Adapter(config);
    this.socketIo = socketIo;

    this.queue.subscribe('io', function(message) {
        self.emit('app ' + message.type, message);
    });

    this.socketIo.on('clientConnect', function(client) {
        self.emit('socket connection', client);
    });

    this.socketIo.on('clientMessage', function(data, client) {
        self.emit('socket message', client, data);
    });

    this.socketIo.on('clientDisconnect', function(client) {
        self.emit('socket disconnect', client);
    });
}

Server.prototype.__proto__ = EventEmitter.prototype;

Server.prototype.createMessage = function(client, data) {
    return new Message(this, client, data);
};

Server.prototype._publish = function(message) {
    this.queue.publish('app', message._getData());
};


function Message(server, client, data) {
    this.server = server;
    this.type = 'custom';

    this.setClient(client);
    this.setData(data);
}

Message.prototype.send = function() {
    this.server._publish(this);
};

Message.prototype.setClient = function(client) {
    this.client = client;

    return this;
};

Message.prototype.setData = function(data) {
    this.data = data;

    return this;
};

Message.prototype.setType = function(type) {
    this.type = type;

    return this;
};

Message.prototype._getData = function() {
    return {
        type: this.type,
        client: this.client,
        data: this.data
    };
};


function EventHandler(server) {
    var self = this;
    this.server = server;
    this.socketIo = server.socketIo;

    this.server.on('app publish', function(message) {
        var exceptions = message.exceptions || [];

        for (var i = message.recipients.length; i--; ) {
            self.publishMessage(message.recipients[i], exceptions, message.data);
        }
    });

    this.server.on('app subscribe-to-channel', function(message) {
        for (var i = message.recipients.length; i--; ) {
            self.subscribeToChannel(message.recipients[i], message.data);
        }
    });

    this.server.on('app unsubscribe-from-channel', function(message) {
        for (var i = message.recipients.length; i--; ) {
            self.unsubscribeFromChannel(message.recipients[i], message.data);
        }
    });

    this.server.on('socket connection', function(client) {
        self.server.createMessage(self.getClientInfo(client)).setType('connection').send();
    });

    this.server.on('socket message', function(client, message) {
        self.server.createMessage(self.getClientInfo(client), message).setType('message').send();
    });

    this.server.on('socket disconnect', function(client) {
        self.server.createMessage(self.getClientInfo(client)).setType('disconnect').send();
    });
}

EventHandler.prototype.getClientInfo = function(client) {
    return {
        sessionId: client.sessionId
    };
};

EventHandler.prototype.publishMessage = function(recipient, exceptions, message) {
    var client = this.findClient(recipient);

    if (client !== undefined) {
        client.send(message);
    } else if (recipient.type == 'channel') {
        this.socketIo.broadcastToChannel(recipient.id, message, exceptions);
    } else if (recipient.type == 'all') {
        this.socketIo.broadcast(message, exceptions);
    }
};

EventHandler.prototype.subscribeToChannel = function(recipient, info) {
    var client = this.findClient(recipient);
    if (client !== undefined) {
        client.subscribeToChannel(info.channel);
    }
};

EventHandler.prototype.unsubscribeFromChannel = function(recipient, info) {
    var client = this.findClient(recipient);
    if (client !== undefined) {
        client.unsubscribeFromChannel(info.channel);
    }
};

EventHandler.prototype.findClient = function(recipient) {
    if (recipient.type == 'client') {
        return this.socketIo.clients[recipient.id];
    }
};
