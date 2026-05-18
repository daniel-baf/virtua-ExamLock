const express = require('express');
const path = require('path');
const { loginStudent } = require('../../domains/auth/loginStudent');
const { getQuestions, queueAnswer, submitExam } = require('../../domains/exam/examService');
const { uploadCapture } = require('../../domains/proctoring/uploadCapture');

function createAgentApp({ serverUrl, port, state, sse }) {
  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../../ui')));

  app.post('/api/login', async (req, res) => {
    const { studentName, sessionCode } = req.body;
    if (!studentName || !sessionCode) {
      return res.status(400).json({ error: 'missing_fields' });
    }

    try {
      res.json(await loginStudent({ studentName, sessionCode, serverUrl, state, sse }));
    } catch (err) {
      console.error('login error:', err.message);
      res.status(err.statusCode ?? 500).json({ error: err.statusCode ? err.message : 'server_unreachable' });
    }
  });

  app.get('/api/questions', async (_req, res) => {
    try {
      res.json(await getQuestions({ serverUrl, state }));
    } catch (err) {
      res.status(err.statusCode ?? 502).json({ error: err.statusCode ? err.message : 'fetch_failed' });
    }
  });

  app.post('/api/answer', async (req, res) => {
    try {
      res.json(await queueAnswer({ ...req.body, serverUrl, state }));
    } catch (err) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  });

  app.post('/api/submit', async (_req, res) => {
    try {
      res.json(await submitExam({ serverUrl, state, sse }));
    } catch (err) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  });

  app.post('/proctor/upload', (req, res) => {
    try {
      res.json(uploadCapture({ ...req.body, state }));
    } catch (err) {
      res.status(err.statusCode ?? 500).json({ error: err.message });
    }
  });

  app.get('/api/events', (req, res) => sse.attach(req, res));

  app.get('/api/state', (_req, res) => {
    const current = state.getState();
    res.json({ status: current.status, endsAt: current.endsAt ?? null });
  });

  app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '../../../ui', 'login.html')));
  app.get('/exam', (_req, res) => res.sendFile(path.join(__dirname, '../../../ui', 'exam.html')));
  app.get('/ended', (_req, res) => res.sendFile(path.join(__dirname, '../../../ui', 'ended.html')));

  app.listen(port, () => console.log(`agent listening on :${port}`));
  return app;
}

module.exports = { createAgentApp };
