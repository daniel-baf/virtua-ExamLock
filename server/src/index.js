require('dotenv').config();

const http = require('http');
const { getAllowedOrigins } = require('./app/config/getAllowedOrigins');
const { createApp } = require('./app/http/createApp');
const { createSocketServer } = require('./app/socket/createSocketServer');

const allowedOrigins = getAllowedOrigins();
const app = createApp({ io: null, allowedOrigins });
const httpServer = http.createServer(app);
const io = createSocketServer(httpServer, allowedOrigins);
app.set('io', io);

const PORT = process.env.PORT ?? 8080;
httpServer.listen(PORT, () => console.log(`server listening on :${PORT}`));
