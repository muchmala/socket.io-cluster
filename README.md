Socket.IO cluster: Scalable Socket.IO
=====================================

Socket.IO cluster provides ability to have multiple Socket.IO servers at once and interact with them using message queue.

## Requirements
- Node.JS (tested on v0.4.7)
- Redis

## How it works
Socket.IO cluster consist of two parts: server (io-node) and client (app-node).

Io-node uses Socket.IO (https://github.com/LearnBoost/Socket.IO-node) to create connection with browser and pushes all
client messages to Redis queue.

Client-node listens Redis queue and react by sending some commands to all io-nodes (using queue as well).

## How to use
If you look in examples folder, you'll see the same example as for ordinary Socket.IO but instead of `server.js` you'll
see `appNode.js` and `ioNode.js`.

`ioNode.js` looks like normal http server and it actually is 'normal http server' part from mentioned Socket.IO example.
At the very bottom of the file you should see

    iocluster.listen(server, config);

This code creates io-node (of Socket.IO-cluster).

`appNode.js` looks as Socket.IO part of mentioned Socket.IO example (and it is actually copied from there) except one
line:

    var io = iocluster.getClient(config);

This code creates instance of app-node.

As you probably noticed there is some config passed to both io-node and app-node. This config contains some options
like Redis host and port and I think it's pretty much self-explaining:

    config.HTTP_HOST = '0.0.0.0';
    config.HTTP_PORT = 8080;

    config.REDIS_HOST = '127.0.0.1';
    config.REDIS_PORT = 6379;
    config.REDIS_PASSWORD = undefined;

### How to run the example
After installing all dependencies make following steps:

1. Start Redis

        cd path/to/your/redis/
        src/redis-server

2. Go to Socket.IO-cluster dir:

        cd path/to/socket.io-cluster

3. Start app-node:

        node tests/appNode.js

4. Start some io-nodes:

        node tests/ioNode.js -p 8080
        node tests/ioNode.js -p 8081
        ...

5. Point your browser to `http://localhost:8080`, `http://localhost:8081` and so on.

## Documentation

### io-node listener

    ioCluster.listen(<http.Server>, config)

Returns: io-node `Listener` instance.

### app-node listener

    ioCluster.getClient(config);

Returns: app-node `Listener` instance.
It's public interface is the same as Socket.IO `Listener's` public interface. For documentation please check (https://github.com/LearnBoost/Socket.IO-node)

## Stateless app-node approach

If you want your application to be really highly available you should design it to be stateless so you can restart any
node without need to restart all application. The problem is that when you restart app-node, you loose context. So when
one of users sends message you do not have instance of client and need to recreate it. So `io.on('connection',..)` has
special flag as argument `isReconnect`.
