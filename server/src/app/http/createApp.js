const express = require('express');
const { registerRoutes } = require('./registerRoutes');

function createApp({ io, allowedOrigins }) {
  const app = express();

  app.set('io', io);
  app.use(express.json({ limit: '10mb' }));
  app.use(createCorsMiddleware(allowedOrigins));

  registerRoutes(app);
  return app;
}

function createCorsMiddleware(allowedOrigins) {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin ?? '*');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    }
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  };
}

module.exports = { createApp };
