const express = require('express');
const path = require('path');
const { io: ioClient } = require('socket.io-client');
const fs = require('fs');
const { applyWhitelist } = require('./firewall');
const { capture } = require('./screenshot');
const { execSync } = require('child_process');

// ── Config ────────────────────────────────────────────────────────────────────

function readConfig() {
  const raw = fs.readFileSync('/etc/examlock.conf', 'utf8');
  const cfg = {};
  raw.split('\n').forEach(line => {
    const eq = line.indexOf('=');
    if (eq < 0) return;
    cfg[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
  return cfg;
}

const config = readConfig();
const SERVER_URL = config.SERVER_URL;
const FIREBASE_API_KEY = config.FIREBASE_API_KEY;

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  status: 'idle', // idle | waiting | admitted | kicked | ended
  idToken: null,
  sessionId: null,
  sessionCode: null,
  socket: null,
};

// ── App ───────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'ui')));

app.get('/config', (_req, res) => {
  res.json({
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
  });
});

app.get('/api/state', (_req, res) => res.json({ status: state.status }));

// ── Login ─────────────────────────────────────────────────────────────────────

app.post('/api/login', async (req, res) => {
  const { email, password, code } = req.body;
  if (!email || !password || !code) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  if (state.status !== 'idle') {
    return res.status(409).json({ error: 'already_logged_in' });
  }

  try {
    // 1. Authenticate with Firebase REST API
    const authRes = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    const authData = await authRes.json();
    if (!authRes.ok) {
      const msg = authData.error?.message ?? 'auth_failed';
      throw new Error(msg === 'INVALID_PASSWORD' || msg === 'EMAIL_NOT_FOUND' ? 'invalid_credentials' : msg);
    }

    state.idToken = authData.idToken;

    // 2. Join session on server (verifies role=student + code)
    const joinRes = await fetch(`${SERVER_URL}/api/session/${code}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.idToken}`,
      },
    });
    const joinData = await joinRes.json();
    if (!joinRes.ok) throw new Error(joinData.error ?? 'join_failed');

    state.sessionId = joinData.sessionId;
    state.sessionCode = code;
    state.status = 'waiting';

    // 3. Connect socket
    connectSocket(code);

    res.json({ ok: true, status: 'waiting' });
  } catch (err) {
    console.error('[login]', err.message);
    state.status = 'idle';
    state.idToken = null;
    res.status(401).json({ error: err.message });
  }
});

// ── SSE ───────────────────────────────────────────────────────────────────────

const sseClients = new Set();

function broadcast(name, data) {
  const msg = `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(send => send(msg));
}

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const send = msg => res.write(msg);
  sseClients.add(send);
  res.write('event: connected\ndata: {}\n\n');
  res.write(`event: state\ndata: ${JSON.stringify({ status: state.status })}\n\n`);

  req.on('close', () => sseClients.delete(send));
});

// ── Pages ─────────────────────────────────────────────────────────────────────

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '..', 'ui', 'login.html')));
app.get('/waiting', (_req, res) => res.sendFile(path.join(__dirname, '..', 'ui', 'waiting.html')));
app.get('/exam', (_req, res) => res.sendFile(path.join(__dirname, '..', 'ui', 'exam.html')));
app.get('/ended', (_req, res) => res.sendFile(path.join(__dirname, '..', 'ui', 'ended.html')));

// ── Socket connection ─────────────────────────────────────────────────────────

function connectSocket(sessionCode) {
  const socket = ioClient(SERVER_URL, {
    auth: { token: state.idToken },
    query: { sessionCode },
    reconnection: true,
    reconnectionDelay: 2000,
  });

  state.socket = socket;

  socket.on('connect', () => {
    console.log('[socket] connected');
    broadcast('state', { status: state.status });
  });

  socket.on('disconnect', () => {
    console.log('[socket] disconnected');
    broadcast('state', { status: state.status });
  });

  // Admitted: apply whitelist and redirect UI
  socket.on('server:admitted', async ({ whitelist = [], blockInternet = false }) => {
    state.status = 'admitted';
    try {
      await applyWhitelist(whitelist, blockInternet);
    } catch (err) {
      console.error('[firewall]', err.message);
    }
    broadcast('admitted', { whitelist, blockInternet });
  });

  // Whitelist update mid-exam
  socket.on('server:whitelist', async ({ whitelist = [], blockInternet = false }) => {
    try {
      await applyWhitelist(whitelist, blockInternet);
    } catch (err) {
      console.error('[firewall]', err.message);
    }
    broadcast('whitelist', { whitelist, blockInternet });
  });

  // On-demand screenshot
  socket.on('server:capture-now', async ({ requestId }) => {
    try {
      const jpegB64 = capture();
      socket.emit('student:screenshot', { jpegB64, requestId });
    } catch (err) {
      console.error('[screenshot]', err.message);
    }
  });

  // Message from teacher
  socket.on('server:message', ({ text }) => {
    broadcast('message', { text });
  });

  // Kicked
  socket.on('server:kicked', ({ reason }) => {
    state.status = 'kicked';
    broadcast('kicked', { reason });
    killSession(3000);
  });

  // Exam ended
  socket.on('server:exam-ended', () => {
    state.status = 'ended';
    broadcast('exam-ended', {});
    killSession(5000);
  });

  // Heartbeat
  setInterval(() => {
    if (socket.connected) socket.emit('student:heartbeat');
  }, 10_000);
}

function killSession(delayMs) {
  setTimeout(() => {
    try {
      execSync('loginctl terminate-user examuser', { stdio: 'pipe' });
    } catch {}
  }, delayMs);
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(7878, '127.0.0.1', () => console.log('[daemon] listening on 127.0.0.1:7878'));
