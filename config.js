var config = exports;

config.HTTP_HOST = '0.0.0.0';
config.HTTP_PORT = 80;

config.REDIS_HOST = '127.0.0.1';
config.REDIS_PORT = 6379;
config.REDIS_PASSWORD = undefined;
config.REDIS_DATABASE = 0;

config.CLIENT_CONFIG_URL = '/config.js';

config.IO_SERVERS = [
    {externalHost: '33.33.33.10', externalPort: 8081, internalHost: '0.0.0.0', internalPort: 8081},
    {externalHost: '33.33.33.10', externalPort: 8082, internalHost: '0.0.0.0', internalPort: 8082}
];

try {
    var config_local = require('./config.local.js');
    for (var key in config_local) {
         config[key] = config_local[key];
    }
}catch(e) {}
