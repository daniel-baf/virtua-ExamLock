const express = require('express');
const path = require('path');
const socketClient = require('./socket');
const heartbeat = require('./heartbeat');
const answers = require('./answers');

const SERVER_URL = process.env.SERVER_URL;
const PORT = process.env.AGENT_PORT ?? 3000;

// Session state — populated after student joins
let state = {
  studentId: null,
  sessionId: null,
  token: null,
  questions: [],
  status: 'idle', // idle | active | ended
};

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'ui')));

// ── Login ────────────────────────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
  const { studentName, sessionCode } = req.body;
  if (!studentName || !sessionCode) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  try {
    const joinRes = await fetch(`${SERVER_URL}/api/session/${sessionCode}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName }),
    });

    if (!joinRes.ok) {
      const err = await joinRes.json().catch(() => ({}));
      return res.status(joinRes.status).json({ error: err.error ?? 'join_failed' });
    }

    const data = await joinRes.json();
    state = { ...state, ...data, status: 'active' };

    // Connect socket & start heartbeat
    const sock = socketClient.connect(SERVER_URL, data.token);
    heartbeat.start();
    answers.flush(data.sessionId, data.token, SERVER_URL);

    // Forward server commands to browser via SSE (see /api/events)
    sock.on('server:block-internet', () => broadcastEvent('block-internet', {}));
    sock.on('server:unblock-internet', () => broadcastEvent('unblock-internet', {}));
    sock.on('server:reactivate', ({ token }) => broadcastEvent('reactivate', { token }));
    sock.on('server:message', ({ text }) => broadcastEvent('message', { text }));
    sock.on('server:exam-ended', () => {
      state.status = 'ended';
      broadcastEvent('exam-ended', {});
    });

    socketClient.onReconnect(() => {
      answers.flush(state.sessionId, state.token, SERVER_URL);
    });

    res.json({ ok: true, sessionId: data.sessionId, endsAt: data.endsAt });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'server_unreachable' });
  }
});

// ── Questions ────────────────────────────────────────────────────────────────

app.get('/api/questions', async (req, res) => {
  if (!state.token) return res.status(401).json({ error: 'not_joined' });

  if (state.questions.length > 0) return res.json({ questions: state.questions });

  try {
    const r = await fetch(`${SERVER_URL}/api/exam/${state.sessionId}`, {
      headers: { Authorization: `Bearer ${state.token}` },
    });
    const data = await r.json();
    state.questions = data.questions ?? [];
    res.json({ questions: state.questions });
  } catch {
    res.status(502).json({ error: 'fetch_failed' });
  }
});

// ── Answers ──────────────────────────────────────────────────────────────────

app.post('/api/answer', async (req, res) => {
  const { questionId, answer } = req.body;
  if (!questionId || answer === undefined) {
    return res.status(400).json({ error: 'missing_fields' });
  }

  answers.enqueue(questionId, answer);

  // Best-effort immediate sync
  if (socketClient.isConnected()) {
    await answers.flush(state.sessionId, state.token, SERVER_URL);
  }

  res.json({ queued: true });
});

// ── Submit exam ──────────────────────────────────────────────────────────────

app.post('/api/submit', async (req, res) => {
  if (!state.token) return res.status(401).json({ error: 'not_joined' });
  await answers.flush(state.sessionId, state.token, SERVER_URL);
  socketClient.emit('student:closed', { studentId: state.studentId, reason: 'submitted' });
  state.status = 'ended';
  broadcastEvent('exam-ended', {});
  res.json({ ok: true });
});

// ── Proctor upload (from host script) ───────────────────────────────────────

app.post('/proctor/upload', (req, res) => {
  const { type, imageBase64 } = req.body; // type: 'screen' | 'camera'
  if (!imageBase64) return res.status(400).json({ error: 'missing_image' });

  const event = type === 'camera' ? 'student:camera' : 'student:screenshot';
  socketClient.emit(event, { studentId: state.studentId, imageBase64 });
  res.json({ ok: true });
});

// ── SSE — push server events to browser ──────────────────────────────────────

const sseClients = new Set();

function broadcastEvent(name, data) {
  const msg = `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(send => send(msg));
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = (msg) => res.write(msg);
  sseClients.add(send);
  res.write('event: connected\ndata: {}\n\n');

  req.on('close', () => sseClients.delete(send));
});

// ── State (timer) ────────────────────────────────────────────────────────────

app.get('/api/state', (_req, res) => {
  res.json({ status: state.status, endsAt: state.endsAt ?? null });
});

// ── Serve pages ──────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'ui', 'login.html')));
app.get('/exam', (_req, res) => res.sendFile(path.join(__dirname, 'ui', 'exam.html')));
app.get('/ended', (_req, res) => res.sendFile(path.join(__dirname, 'ui', 'ended.html')));

app.listen(PORT, () => console.log(`agent listening on :${PORT}`));
