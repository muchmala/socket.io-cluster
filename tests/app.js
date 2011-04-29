var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    opts = require('opts'),
    iocluster = require('..'),
    config = require('./config');

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

var server = http.createServer(function(req, res){
  // your normal server code
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
      res.end();
      break;

    case '/json.js':
    case '/chat.html':
      fs.readFile(__dirname + path, function(err, data){
        res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
  }
});

server.listen(port);
iocluster.listen(server, config);
