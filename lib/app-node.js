var EventEmitter = require('events').EventEmitter,
    queue = require('../queue'),
    CHANNELS = require('./channels');

exports.listener = listener;

function listener(config) {
    var that = this;
    this.publisher = queue.getPublisher(config);
    this.clients = {};

    queue.getListener(config).subscribe(CHANNELS.incoming, function(message) {
        if (message.type == 'connection') {
            that.emit('connection', that._makeClient(message.client));

        } else {
            that._getClient(message.client).emit(message.type, message.data);

            if (message.type == 'disconnect') {
                delete that.clients[message.client];
            }
        }
    });
}

listener.prototype.__proto__ = EventEmitter.prototype;

listener.prototype.exec = function(method, args, context) {
    this.publisher.publish(CHANNELS.outgoing, createMessage((context || 'listener'), method, args));
};

listener.prototype._getClient = function(sessionId) {
    if (!(sessionId in this.clients)) {
        this.emit('no-client', this._makeClient(sessionId));
    }

    return this.clients[sessionId];
};

listener.prototype._makeClient = function(sessionId) {
    return this.clients[sessionId] = new client(this, sessionId);
};


function client(listener, sessionId) {
    this.sessionId = sessionId;
    this.listener = listener;
}

client.prototype.__proto__ = EventEmitter.prototype;

client.prototype.exec = function(method, args) {
    this.listener.exec(method, args, this.sessionId);
};

client.prototype.broadcast = function(message){
  this.listener.broadcast(message, this.sessionId);
  return this;
};

client.prototype.broadcastToChannel = function(channel, message){
  this.listener.broadcastToChannel(channel, message, this.sessionId);
  return this;
};

addMethods(listener, ['broadcast', 'broadcastExcept', 'broadcastOnly', 'broadcastToChannel']);
addMethods(client, ['send', 'subscribeToChannel', 'unsubscribeFromChannel']);


function createMessage(context, method, args) {
    return {
        context: context,
        method: method,
        args: args
    };
}

function addMethods(class, methods) {
    for (var i = methods.length, method; i--;) {
        method = methods[i];
        class.prototype[method] = (function(method) {
            return function() {
                this.exec(method, Array.prototype.slice.call(arguments));
                return this;
            }
        }(method));
    }
}
