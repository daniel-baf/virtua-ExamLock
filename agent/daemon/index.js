const express = require('express');
const path = require('path');
const { io: ioClient } = require('socket.io-client');
const { applyWhitelist, initFirewall, getDebugState } = require('./firewall');
const { capture } = require('./screenshot');
const { execFileSync } = require('child_process');
const { log } = require('./logger');
const {
  config,
  EXAM_USER,
  SERVER_URL,
  FIREBASE_API_KEY,
  SCREENSHOT_INTERVAL_MS,
} = require('./config');

// ── Config ────────────────────────────────────────────────────────────────────

const BROWSER_PROCESS_PATTERN = '(chromium|chromium-browser|google-chrome)';

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  status: 'idle', // idle | waiting | admitted | kicked | ended
  idToken: null,
  sessionId: null,
  sessionCode: null,
  socket: null,
};

let browserSeen = false;
let closingSession = false;
let screenshotInFlight = false;

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

app.get('/api/debug', (_req, res) => {
  const { socket, ...safeState } = state;
  res.json({
    state: { ...safeState, socketConnected: socket?.connected ?? false },
    firewall: getDebugState(),
  });
});

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
    log('login', 'firebase auth ok for', email);

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
    log('login', 'joined session', joinData.sessionId, 'code:', code);

    // 3. Connect socket
    connectSocket(code);

    res.json({ ok: true, status: 'waiting' });
  } catch (err) {
    log('login', 'ERROR', err.message);
    state.status = 'idle';
    state.idToken = null;
    res.status(401).json({ error: err.message });
  }
});

// ── Finish exam ───────────────────────────────────────────────────────────────

app.post('/api/finish', async (req, res) => {
  if (state.status !== 'admitted') return res.status(409).json({ error: 'not_active' });
  await closeSession('submitted', { kill: false });
  res.json({ ok: true });
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

initFirewall().catch(err => log('firewall', 'init ERROR:', err.message));

try {
  execFileSync('id', ['-u', EXAM_USER], { stdio: 'pipe' });
} catch {
  log('startup', `CRITICAL: ${EXAM_USER} does not exist — firewall and screenshots will not work`);
}

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
    log('socket', 'connected, state:', state.status);
    broadcast('state', { status: state.status });
  });

  socket.on('disconnect', () => {
    log('socket', 'disconnected');
    broadcast('state', { status: state.status });
  });

  // Admitted: apply whitelist and redirect UI
  socket.on('server:admitted', async ({ whitelist = [], blockInternet = false }) => {
    log('socket', 'server:admitted received', { whitelist, blockInternet });
    state.status = 'admitted';
    try {
      await applyWhitelist(whitelist, blockInternet, true);
    } catch (err) {
      log('firewall', 'ERROR applying whitelist:', err.message);
    }
    const alertText = whitelist.length > 0
      ? `Acceso habilitado a: ${whitelist.join(', ')}`
      : blockInternet ? 'Internet restringido — sin dominios autorizados' : 'Acceso libre a internet';
    broadcast('admitted', { whitelist, blockInternet });
    broadcast('alert', { kind: 'whitelist-applied', text: alertText });
    log('socket', 'admitted broadcast sent');
  });

  // Whitelist update mid-exam
  socket.on('server:whitelist', async ({ whitelist = [], blockInternet = false }) => {
    log('socket', 'server:whitelist received', { whitelist, blockInternet });
    try {
      await applyWhitelist(whitelist, blockInternet, true);
    } catch (err) {
      log('firewall', 'ERROR applying whitelist update:', err.message);
    }
    const alertText = whitelist.length > 0
      ? `Whitelist actualizada: ${whitelist.join(', ')}`
      : blockInternet ? 'Whitelist vaciada — internet bloqueado' : 'Internet ahora libre';
    broadcast('whitelist', { whitelist, blockInternet });
    broadcast('alert', { kind: 'whitelist-applied', text: alertText });
  });

  // On-demand screenshot
  socket.on('server:capture-now', async ({ requestId }) => {
    await sendScreenshot(requestId ?? `manual_${Date.now()}`);
  });

  // Message from teacher
  socket.on('server:message', ({ text }) => {
    broadcast('message', { text });
  });

  // Kicked
  socket.on('server:kicked', ({ reason }) => {
    log('socket', 'server:kicked reason:', reason);
    state.status = 'kicked';
    applyWhitelist([], false, false).catch(err => log('firewall', 'ERROR on kick lock:', err.message));
    broadcast('kicked', { reason });
    killSession(3000);
  });

  // Exam ended
  socket.on('server:exam-ended', () => {
    log('socket', 'server:exam-ended');
    state.status = 'ended';
    applyWhitelist([], false, false).catch(err => log('firewall', 'ERROR on end lock:', err.message));
    broadcast('exam-ended', {});
    killSession(5000);
  });

  // Heartbeat
  setInterval(() => {
    if (socket.connected) socket.emit('student:heartbeat');
  }, 10_000);
}

async function sendScreenshot(requestId) {
  if (!state.socket?.connected) return;
  if (screenshotInFlight) {
    log('screenshot', 'skipping capture already in flight', requestId);
    return;
  }

  screenshotInFlight = true;
  log('screenshot', 'capture requested', requestId);
  try {
    const jpegB64 = capture();
    log('screenshot', 'capture ok, sending to server');
    state.socket.emit('student:screenshot', { jpegB64, requestId });
  } catch (err) {
    log('screenshot', 'ERROR:', err.message);
    state.socket.emit('student:screenshot-error', { requestId, error: err.message });
  } finally {
    screenshotInFlight = false;
  }
}

async function closeSession(reason, { kill = true, killDelayMs = 2000 } = {}) {
  if (closingSession) return;
  closingSession = true;

  log('session', 'closing session:', reason);
  if (state.socket?.connected) state.socket.emit('student:closed', { reason });
  state.status = 'ended';
  try {
    await applyWhitelist([], false, false);
  } catch (err) {
    log('firewall', 'ERROR on close lock:', err.message);
  }
  broadcast('exam-ended', { reason });
  if (kill) killSession(killDelayMs);
}

function hasBrowserProcess() {
  try {
    execFileSync('pgrep', ['-u', EXAM_USER, '-f', BROWSER_PROCESS_PATTERN], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function startBrowserWatchdog() {
  setInterval(() => {
    const browserRunning = hasBrowserProcess();
    if (browserRunning) {
      browserSeen = true;
      return;
    }

    if (state.status === 'admitted' && browserSeen) {
      closeSession('browser_closed').catch(err => log('session', 'ERROR closing after browser exit:', err.message));
    }
  }, 2000);
}

function startPeriodicScreenshots() {
  if (!Number.isFinite(SCREENSHOT_INTERVAL_MS) || SCREENSHOT_INTERVAL_MS <= 0) return;

  setInterval(() => {
    if (state.status !== 'admitted') return;
    if (!state.socket?.connected) return;
    sendScreenshot(`auto_${Date.now()}`).catch(err => log('screenshot', 'periodic ERROR:', err.message));
  }, SCREENSHOT_INTERVAL_MS);
}

function killSession(delayMs) {
  setTimeout(() => {
    try {
      execFileSync('loginctl', ['terminate-user', EXAM_USER], { stdio: 'pipe' });
    } catch {}
  }, delayMs);
}

// ── Start ─────────────────────────────────────────────────────────────────────

startBrowserWatchdog();
startPeriodicScreenshots();

app.listen(7878, '127.0.0.1', () => log('daemon', 'listening on 127.0.0.1:7878'));
