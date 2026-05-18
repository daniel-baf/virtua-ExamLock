require('dotenv').config();

const http = require('http');
const { getAllowedOrigins } = require('./app/config/getAllowedOrigins');
const { createApp } = require('./app/http/createApp');
const { createSocketServer } = require('./app/socket/createSocketServer');

const allowedOrigins = getAllowedOrigins();
const httpServer = http.createServer();
const io = createSocketServer(httpServer, allowedOrigins);
const app = createApp({ io, allowedOrigins });

httpServer.removeAllListeners('request');
httpServer.on('request', app);

const PORT = process.env.PORT ?? 8080;
httpServer.listen(PORT, () => console.log(`server listening on :${PORT}`));
