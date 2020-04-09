import Debug from "debug";
import http from "http";
import https from "https";
import fs from "fs";

import app from "./app";
import { PORT } from "./constants/server";

const debug = Debug('confusionserver:server');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || PORT);
app.set('port', port);
app.set('secPort', port + 443);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);


/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Create HTTPS server.
 */

const options = {
  key: fs.readFileSync(__dirname + '/bin/private.key'),
  cert: fs.readFileSync(__dirname + '/bin/certificate.pem'),
}

const secureServer = https.createServer(options, app);
secureServer.listen(app.get('secPort'), () => {
	console.log('Server listening on port', app.get('secPort'))
});
secureServer.on('error', onError);
secureServer.on('listening', onListening);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
	const port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return parseInt(PORT);
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return parseInt(PORT);
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: NodeJS.ErrnoException) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

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
	const addr = server.address();
	if(addr === null) return debug('addr is null');
	
	const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;

	debug('Listening on ' + bind);
}