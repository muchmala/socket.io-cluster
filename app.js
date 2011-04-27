var http = require('http'),
    url = require('url'),
    io = require('socket.io'),
    config = require('./config');

var server = http.createServer(makeRoutes({
    '^/broadcast$': function(request, response) {
        response.write("!!!broadcast!!!");
    },

    '^/broadcast/(\\d+)$': function(request, response, channel) {
        response.write("BROADCASTING on CHANNEL " + channel);
    }
}, send404));

server.listen(config.HTTP_PORT);

// socket.io, I choose you
// simplest chat application evar
var io = io.listen(server)
    , buffer = [];

io.on('connection', function(client) {
    client.send({ buffer: buffer });
    client.broadcast({ announcement: client.sessionId + ' connected' });

    client.on('message', function(message) {
        var msg = { message: [client.sessionId, message] };
        buffer.push(msg);
        if (buffer.length > 15) buffer.shift();
        client.broadcast(msg);
    });

    client.on('disconnect', function() {
        client.broadcast({ announcement: client.sessionId + ' disconnected' });
    });
});

function makeRoutes(routes, defaultCallback) {
    var matchers = [];

    for (var i in routes) {
        matchers.push({
            pattern: new RegExp(i),
            callback: routes[i]
        });
    }

    return function(request, response) {
        var path = getPath(request);

        for (var i = 0, cnt = matchers.length; i < cnt; ++i) {
            if (matchers[i].pattern.test(path)) {
                matchers[i].callback.apply(this, [request, response].concat(matchers[i].pattern.exec(path).slice(1)));
                response.end();
                return;
            }
        }

        defaultCallback.call(this, request, response);
        response.end();
    }

    function getPath(request) {
        return trimPath(url.parse(request.url).pathname);
    }

    function trimPath(path) {
        if (path.charAt(path.length - 1) == '/') {
            path = path.slice(0, path.length - 1);
        }

        return path;
    }
}

function send404 (request, response) {
        //res.writeHead(404);
    response.write(request.url + '==404');
}
