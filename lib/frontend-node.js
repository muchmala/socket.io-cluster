var io = require('socket.io'),
    url = require('url');

exports.Server = Server;

function Server(server, config) {
    config = config || {};
    var self = this;

    this.clientConfigUrl = config.CLIENT_CONFIG_URL || '/config.js';
    this.ioServers = config.IO_SERVERS || [];

    server.on('request', function(request, response) {
        if (url.parse(request.url).pathname == self.clientConfigUrl) {
            var ioServers = self.getIoServersList();

            response.writeHead(200, {'Content-Type': 'text/javascript'});
            response.write('var SOCKET_SERVERS = ' + JSON.stringify(ioServers) + ';', 'utf8');
            response.end();
        }
    });

    return io.listen(server);

}

Server.prototype.getIoServersList = function() {
    if (!this.ioServers.length) {
        return [];
    }

    var _tmp = this.ioServers.concat();
    _tmp.push(_tmp.shift());

    this.ioServers = _tmp;

    var servers = [];
    for (var i = 0, cnt = _tmp.length; i < cnt; ++i) {
        servers.push({
            host: _tmp[i].external,
            port: _tmp[i].port
        });
    }

    return servers;
}