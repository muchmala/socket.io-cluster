Socket.IO cluster: Scalable Socket.IO
=====================================

Socket.IO cluster provides ability to have multiple Socket.IO servers at once and interact with them using message queue.

## Requirements
- Node.JS (tested on v0.4.7)
- Redis

## How it works
Socket.IO cluster consist of three parts:

* frontend-node - gives user pages of your project, flash socket policy file and list of available io-nodes
* io-node - keeps connection with user using websockets, flashsockets etc.
* app-node - process user actions (received from io-nodes), and gives back some reactions

Frontend-node uses [Socket.IO](https://github.com/LearnBoost/Socket.IO-node) to listen on 843 port and generate
flashsockets policy file.

Io-node uses [Socket.IO](https://github.com/LearnBoost/Socket.IO-node) to create connection with browser and pushes all
client messages to Redis queue. This messages are delivered to app-nodes by round robin scheme (one message to one server).

App-node listens Redis queue and react by sending some commands to all io-nodes (using queue as well).

You can have as many of each node as you want.

## How to use
If you look in examples folder, you'll see the same example as for ordinary Socket.IO but instead of `server.js` you'll
see `appNode.js`, `ioNode.js` and `frontendServer.js`.

`frontendServer.js` looks like normal http server and it actually is 'normal http server' part from mentioned Socket.IO example.
At the very bottom of the file you should see

    socketIoCluster.makeFrontendServer(server, config);

This code creates frontend-node (of Socket.IO-cluster).

`ioNode.js` also has http example code. It is to show that we can use Socket.IO-cluster without `frontend-node`.
Then we'll have only one `io-node` and it'll contain all `frontend-node` logic. But if we do not want this, io-node can
look like this:

    var ioCluster = require('socket.io-cluster'),
        http = require('http'),
        opts = require('opts'),
        config = require('../config');

    opts.parse([
        {
            'short': 'p',
            'long': 'port',
            'description': 'HTTP port',
            'value': true,
            'required': false
        }
    ], true);

    var port = opts.get('port') || config.HTTP_PORT;

    var server = http.createServer();
        server.listen(port);

    ioCluster.makeIoListener(server, config);

`appNode.js` looks as Socket.IO part of mentioned Socket.IO example (and it is actually copied from there). The main
line in that file is:

    var io = iocluster.makeListener(config);

This code creates instance of app-node.

As you probably noticed there is some config passed to every node. This config contains some options
like Redis host and port and I think it's pretty much self-explaining:

    config.HTTP_HOST = '0.0.0.0'; //this is for frontend-node
    config.HTTP_PORT = 80;        //(and for io-node if we do not use frontend-node)

    config.REDIS_HOST = '127.0.0.1';
    config.REDIS_PORT = 6379;
    config.REDIS_PASSWORD = undefined;
    config.REDIS_DATABASE = 0;

    config.CLIENT_CONFIG_URL = '/config.js';

    config.IO_SERVERS = [         //this list is accessible from from frontend-node by url /config.js
        {internal: '0.0.0.0', external: '33.33.33.10', port: 8081},
        {internal: '0.0.0.0', external: '33.33.33.10', port: 8082}
    ];

### How to run the example
After installing all dependencies make following steps:

1. Start Redis

        cd path/to/your/redis/
        src/redis-server

2. Go to Socket.IO-cluster dir:

        cd path/to/socket.io-cluster

3. Start app-node:

        node example/appNode.js

4. Start some io-nodes:

        node example/ioNode.js -p 8081
        node example/ioNode.js -p 8082
        ...

5. Start frontend-node:

        sudo node example/frontendServer.js

6. Point your browser to `http://localhost`. You sould see working chat example.

## Documentation

### frontend-node

    ioCluster.makeFrontendServer(<http.Server>, config)

Returns new instance of `frontend-node`


### io-node

    ioNode.Server:
        createMessage(client, data) - returns new instance of `ioNode.Message`

It is pretty simple. And just triggers a bunch of events:

    app <app_node_message.type> (can me set by messageInstance.setType)
        app publish                      emited when app-node sends command to publish something (send, broadcast)
        app subscribe-to-channel         emited when app-node sends command to subscribe some client to some channel
        app unsubscribe-from-channel     emited when app-node sends command to unsubscribe some client from some channel
    socket connection                    emited when some client is conected to SocketIO
    socket message                       emited when some client sends message
    socket disconnect                    emited when some client is disconnected

You can also send some custom messages from your app-node. It'll emit custom messages with prefix `app `

    ioNode.Message(<ioNode.Server>, client, data):
        send - sends message to Redis queue
        setClient(client) - set client, where client is object with key 'sessionId' and some other data
        setData(data) - sets message data
        setType(type) - sets message type

Shortcut methods:

    ioCluster.makeIoServer(<socketIo.Listener>, config)

Creates `io-node` instance.

To automatically handle these events you should create instance of `ioEventsHandler`:

    var ioServer = makeIoServer(socketIo, config);
    new ioNode.EventHandler(ioServer);

This is done by function

    ioCluster.makeIoListener(<socketIo.Listener>, config)

This code crates new instance of `io-node` and returns instance of `ioEventsHandler`

You can add custom logic to your io-node:

    var server = http.createServer();
        server.listen(port);
    var ioNode = ioCluster.makeIoListener(server, config);

    ioNode.getClientInfo = function(client) {        //this makes your server to send custom client info
        return {                                     //(puzzleId and userId) in every message
            sessionId: client.sessionId,
            puzzleId: Object.keys(client.channels)[0],
            userId: client.userId
        };
    };

    ioNode.server.on('app setUserId', function(message) {
        var client = ioNode.socketIo.clients[message.recipients[0].id];
        if (client !== undefined) {                  //you can also subscribe on custom messages from app-nodes
            client.userId = message.data.userId;
        }
    });

### app-node

    ioNode.Server:
        createMessage(client, data) - returns new instance of `appNode.Message`

    appNode.Message(<ioNode.Server>, data):
        send - sends message to Redis queue
        setData(data) - sets message data
        setType(type) - sets message type
        addRecipient(type, id) - sets the recipient this message behove to. Type can be 'client', 'channel' or 'all'.
        forClient(sessionId) - shortcut for adding client as recipient
        forChannel(channelId) - shortcut for adding channel as recipient
        forAll - shortcut for adding all as recipient
        exceptClient(sessionId) - removes client form recipients

By default it fires three events:

    connection - when some client is connected
    message - on some message from client
    disconnect - when client is disconnected

Shortcut methods:

    ioCluster.makeAppServer(config)

Creates new instance of `app-node`.

    ioCluster.makeListener(config)

Creates new instance of `app-node`. Returns new instance of `appNode.SocketIoAdapter`. It's public interface is the same
as Socket.IO `Listener's` public interface. For documentation please check (https://github.com/LearnBoost/Socket.IO-node)

## Stateless app-node approach

If you want your application to be really highly available you should design it to be stateless so you can restart any
node without need to restart all application. The problem is that when you restart app-node, you loose context. So when
one of users sends message you do not have instance of client and need to recreate it. So app-node has special event
`no-client` which means that there was no client and it was recreated.
