var config = exports;

config.HTTP_HOST = '0.0.0.0';
config.HTTP_PORT = 8080;

try {
    var config_local = require('./config.local.js');
    for (var key in config_local) {
         config[key] = config_local[key];
    }
}catch(e) {}
