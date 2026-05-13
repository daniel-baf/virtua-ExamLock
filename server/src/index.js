require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const sessionRoutes = require('./routes/sessions');
const studentRoutes = require('./routes/students');
const devRoutes = require('./routes/dev');
const registerSocket = require('./socket');

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = (process.env.CORS_ORIGINS ?? '*').split(',').map(s => s.trim());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.use('/api/session', sessionRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/dev', devRoutes);

registerSocket(io);

const PORT = process.env.PORT ?? 8080;
httpServer.listen(PORT, () => console.log(`server listening on :${PORT}`));
