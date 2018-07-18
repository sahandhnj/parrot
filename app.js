#!/usr/bin/env node
'use strict';

// load config
let config = require('./app/config/config');

// module dependencies
let serverSettings = require('./app/server');
let debug = require('debug')('express:server');
let fs = require('fs');
let protocol = require(config.protocol);

// create server
let serverPort = normalizePort(config.port);
let newServer = serverSettings.Server.bootstrap();
let app = newServer.app;
let server = protocol.createServer(app);

//listen on provided ports
server.listen(serverPort);

//add error handler
server.on('error', onError);

//start listening on port
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
    let port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    let port = config.port;
    let bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    let addr = server.address();
    let bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    console.log('Parrot');
    console.log('Listening on ' + bind);
}
