var config = exports;

config.HTTP_HOST = '0.0.0.0';
config.HTTP_PORT = 8080;

config.REDIS_HOST = '127.0.0.1';
config.REDIS_PORT = 6379;
config.REDIS_PASSWORD = undefined;

try {
    var config_local = require('./config.local.js');
    for (var key in config_local) {
         config[key] = config_local[key];
    }
}catch(e) {}
