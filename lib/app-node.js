var EventEmitter = require('events').EventEmitter,
    queue = require('./queue');

exports.Server = Server;
exports.SocketIoAdapter = SocketIoAdapter;
exports.Message = Message;

function Server(config) {
    var self = this;
    this.queue = queue.adapter(config);

    this.queue.subscribe('app', function(message) {
        self.emit(message.type, message.client, message.data);
    });
}

Server.prototype.__proto__ = EventEmitter.prototype;

Server.prototype.createMessage = function(data) {
    return new Message(this, data);
};

Server.prototype._publish = function(message) {
    this.queue.broadcast('io', message._getData());
};

function Message(server, data) {
    this.server = server;
    this.recipients = [];
    this.exceptions = [];
    this.type = 'publish';

    this.setData(data);
}

Message.prototype.send = function() {
    this.server._publish(this);
};

Message.prototype.setData = function(data) {
    this.data = data;

    return this;
};

Message.prototype.setType = function(type) {
    this.type = type;

    return this;
};

Message.prototype.addRecipient = function(type, id) {
    if (type != 'channel' && type != 'client') {
        type = 'all';
    }

    this.recipients.push({
        type: type,
        id: id
    });

    return this;
};

Message.prototype.forClient = function(sessionId) {
    return this.addRecipient('client', sessionId);
};

Message.prototype.forChannel = function(channelId) {
    return this.addRecipient('channel', channelId);
};

Message.prototype.forAll = function() {
    return this.addRecipient('all');
};

Message.prototype.exceptClient = function(sessionId) {
    this.exceptions.push({
        id: sessionId
    });

    return this;
};

Message.prototype.getData = function() {
    return {
        sender: this.sender,
        recipients: this.recipients,
        data: this.data
    };
};


function SocketIoAdapter(server) {
    var self = this;
    this.server = server;
    this.clients = {};

    server.on('connection', function(client) {
        var clientInstance = self._makeClient(client);

        self.emit('clientConnect', clientInstance);
        self.emit('connection', clientInstance);
    });

    server.on('message', function(client, message) {
        var clientInstance = self._getClient(client);

        self.emit('clientMessage', clientInstance, message);
        clientInstance.emit('message', message);
    });

    server.on('disconnect', function(client, message) {
        var clientInstance = self._getClient(client);

        self.emit('clientDisconnect', clientInstance);
        clientInstance.emit('disconnect', message);

        self._removeClient(clientInstance);
    });
}

SocketIoAdapter.prototype.__proto__ = EventEmitter.prototype;

SocketIoAdapter.prototype.broadcast = function(data, sessionIds) {
    var message = this.server.createMessage(data);

    if (!Array.isArray(sessionIds)) {
        sessionIds = [sessionIds];
    }

    for (var i = sessionIds.length; i--; ) {
        message.exceptClient(sessionIds[i]);
    }

    message.forAll().send();
};

SocketIoAdapter.prototype.broadcastExcept = SocketIoAdapter.prototype.broadcast;

SocketIoAdapter.prototype.broadcastOnly = function(data, sessionIds) {
    var message = this.server.createMessage(data);

    if (!Array.isArray(sessionIds)) {
        sessionIds = [sessionIds];
    }

    for (var i = sessionIds.length; i--; ) {
        message.forClient(sessionIds[i]);
    }

    message.send();
};

SocketIoAdapter.prototype.broadcastToChannel = function(channel, data, sessionIds) {
    var message = this.server.createMessage(data);

    if (!Array.isArray(sessionIds)) {
        sessionIds = [sessionIds];
    }

    for (var i = sessionIds.length; i--; ) {
        message.exceptClient(sessionIds[i]);
    }

    message.forChannel(channel).send();
};

SocketIoAdapter.prototype._makeClient = function(clientData) {
    this.clients[client.sessionId] = new Client(clientData, self);
};

SocketIoAdapter.prototype._getClient = function(clientData) {
    if (!(clientData.sessionId in this.clients)) {
        this.emit('no-client', this._makeClient(clientData));
    }

    return this.clients[clientData.sessionId];
};

SocketIoAdapter.prototype._removeClient = function(client) {
    if (client.sessionId in this.clients) {
        delete this.clients[client.sessionId];
    }
};


function Client(info, server) {
    for (var keys = Object.keys(info), i = keys.length; i--; ) {
        this[keys[i]] = info[keys[i]];
    }

    this.listener = server;
}

Client.prototype.__proto__ = EventEmitter.prototype;

Client.prototype.send = function(data) {
    this.listener.broadcastOnly(data, this.sessionId);
};

Client.prototype.broadcast = function(data) {
    this.listener.broadcast(data, this.sessionId);
};

Client.prototype.broadcastToChannel = function(channel, data) {
    this.listener.broadcastToChannel(channel, data, this.sessionId);
};

Client.prototype.subscribeToChannel = function(channelId) {
    var message = this.listener.server.createMessage({
        channel: channelId
    });

    message.setType('subscribe-to-channel');
    message.forClient(this.sessionId).send();
};

Client.prototype.unsubscribeFromChannel = function(channelId) {
    var message = this.listener.server.createMessage({
        channel: channelId
    });

    message.setType('unsubscribe-from-channel');
    message.forClient(this.sessionId).send();
};
