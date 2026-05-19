const express = require('express');
const path = require('path');
const { io: ioClient } = require('socket.io-client');
const { applyWhitelist, initFirewall, getDebugState } = require('./firewall');
const { capture } = require('./screenshot');
const { execFileSync } = require('child_process');
const { log, setLogForwarder } = require('./logger');
const keylogger = require('./keylogger');
const {
  config,
  EXAM_USER,
  SERVER_URL,
  FIREBASE_API_KEY,
  LIVE_STREAM_INTERVAL_MS,
  LIVE_STREAM_MAX_WIDTH,
  LIVE_STREAM_MAX_HEIGHT,
} = require('./config');

// ── Config ────────────────────────────────────────────────────────────────────

const BROWSER_PROCESS_PATTERN = '(chromium|chromium-browser|google-chrome)';
const HEARTBEAT_INTERVAL_MS = 15_000;

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  status: 'idle', // idle | waiting | admitted | kicked | ended
  idToken: null,
  sessionId: null,
  sessionCode: null,
  endsAt: null,
  socket: null,
  streamConfig: {
    intervalMs: LIVE_STREAM_INTERVAL_MS,
    maxWidth: LIVE_STREAM_MAX_WIDTH,
    maxHeight: LIVE_STREAM_MAX_HEIGHT,
  },
};

let browserSeen = false;
let closingSession = false;
let screenshotInFlight = false;
let liveStreamTimer = null;
let liveMonitorActive = false;
let keyloggerActive = false;
let keystrokeBatchTimer = null;
const keystrokePending = [];
const keyBuffer = [];

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

app.get('/api/state', (_req, res) => res.json({ status: state.status, endsAt: state.endsAt }));

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
    state.endsAt = joinData.endsAt ?? null;
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
  res.write(`event: state\ndata: ${JSON.stringify({ status: state.status, endsAt: state.endsAt })}\n\n`);

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
  log('socket', 'connecting to server', SERVER_URL, 'sessionCode:', sessionCode);
  const socket = ioClient(SERVER_URL, {
    auth: { token: state.idToken },
    query: { sessionCode },
    reconnection: true,
    reconnectionDelay: 2000,
  });

  state.socket = socket;

  // Log forwarding to teacher dashboard
  let logBatch = [];
  let logBatchTimer = null;
  function flushLogBatch() {
    logBatchTimer = null;
    if (logBatch.length === 0 || !socket.connected) return;
    socket.emit('student:log', { lines: logBatch.splice(0) });
  }
  setLogForwarder((tag, msg) => {
    logBatch.push({ ts: Date.now(), tag, msg });
    if (logBatch.length > 50) logBatch.shift(); // drop oldest if flooding
    if (!logBatchTimer) logBatchTimer = setTimeout(flushLogBatch, 300);
  });

  socket.on('connect', () => {
    log('socket', 'connected, state:', state.status);
    broadcast('state', { status: state.status, endsAt: state.endsAt });
  });

  socket.on('disconnect', () => {
    log('socket', 'disconnected');
    setLogForwarder(null);
    broadcast('state', { status: state.status, endsAt: state.endsAt });
  });

  socket.on('connect_error', err => {
    log('socket', 'connect_error:', err.message);
  });

  socket.io.on('reconnect_attempt', attempt => {
    log('socket', 'reconnect_attempt:', attempt);
  });

  socket.io.on('reconnect_error', err => {
    log('socket', 'reconnect_error:', err.message);
  });

  socket.io.on('reconnect_failed', () => {
    log('socket', 'reconnect_failed');
  });

  // Admitted: apply whitelist and redirect UI
  socket.on('server:admitted', async ({ whitelist = [], blockInternet = false, endsAt = null, streamConfig = null }) => {
    log('socket', 'server:admitted received', { whitelist, blockInternet, streamConfig });
    state.status = 'admitted';
    state.endsAt = endsAt ?? state.endsAt;
    state.streamConfig = normalizeStreamConfig(streamConfig);
    try {
      await applyWhitelist(whitelist, blockInternet, true);
    } catch (err) {
      log('firewall', 'ERROR applying whitelist:', err.message);
    }
    const alertText = whitelist.length > 0
      ? `Acceso habilitado a: ${whitelist.join(', ')}`
      : blockInternet ? 'Internet restringido — sin dominios autorizados' : 'Acceso libre a internet';
    broadcast('admitted', { whitelist, blockInternet, endsAt: state.endsAt });
    broadcast('alert', { kind: 'whitelist-applied', text: alertText });
    log('socket', 'admitted broadcast sent');
    socket.emit('student:stream-ready');
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

  socket.on('server:monitor-start', () => {
    startLiveStream();
  });

  socket.on('server:monitor-stop', () => {
    stopLiveStream();
  });

  socket.on('server:keylogger-start', () => {
    startKeylogger();
  });

  socket.on('server:keylogger-stop', () => {
    stopKeylogger();
  });

  socket.on('server:keystroke-buffer-request', () => {
    if (socket.connected) socket.emit('student:keystroke-buffer', { events: keyBuffer.slice() });
  });

  // Message from teacher
  socket.on('server:message', ({ text }) => {
    broadcast('message', { text });
  });

  // Kicked
  socket.on('server:kicked', ({ reason }) => {
    log('socket', 'server:kicked reason:', reason);
    stopLiveStream();
    stopKeylogger();
    state.status = 'kicked';
    applyWhitelist([], false, false).catch(err => log('firewall', 'ERROR on kick lock:', err.message));
    broadcast('kicked', { reason });
    killSession(3000);
  });

  // Exam ended
  socket.on('server:exam-ended', () => {
    log('socket', 'server:exam-ended');
    stopLiveStream();
    stopKeylogger();
    state.status = 'ended';
    applyWhitelist([], false, false).catch(err => log('firewall', 'ERROR on end lock:', err.message));
    broadcast('exam-ended', {});
    killSession(5000);
  });

  // Heartbeat
  setInterval(() => {
    if (socket.connected) socket.emit('student:heartbeat');
  }, HEARTBEAT_INTERVAL_MS);
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

async function captureFrame() {
  if (!state.socket?.connected || state.status !== 'admitted') return;
  if (!liveMonitorActive) return;
  if (screenshotInFlight) return;

  screenshotInFlight = true;
  try {
    const jpegBuf = capture({
      maxWidth: state.streamConfig.maxWidth,
      maxHeight: state.streamConfig.maxHeight,
      quality: 70,
      asBinary: true,
    });
    state.socket.emit('student:monitor-frame', jpegBuf, { takenAt: Date.now() });
  } catch (err) {
    log('stream', 'ERROR:', err.message);
    state.socket.emit('student:stream-error', {
      error: err.message,
    });
  } finally {
    screenshotInFlight = false;
  }
}

function startLiveStream() {
  if (state.status !== 'admitted') return;
  if (liveMonitorActive) return;

  liveMonitorActive = true;
  if (liveStreamTimer) clearInterval(liveStreamTimer);

  const interval = Number.isFinite(state.streamConfig.intervalMs) && state.streamConfig.intervalMs > 0
    ? state.streamConfig.intervalMs
    : 1000;

  log('stream', 'starting session live stream', 'interval:', interval, 'streamConfig:', state.streamConfig);
  state.socket.emit('student:stream-started');
  captureFrame().catch(err => log('stream', 'initial frame ERROR:', err.message));
  liveStreamTimer = setInterval(() => {
    captureFrame().catch(err => log('stream', 'frame ERROR:', err.message));
  }, interval);
}

function stopLiveStream() {
  if (liveStreamTimer) clearInterval(liveStreamTimer);
  liveStreamTimer = null;
  if (liveMonitorActive && state.socket?.connected) {
    state.socket.emit('student:stream-stopped');
  }
  if (liveMonitorActive) log('stream', 'stopped session live stream');
  liveMonitorActive = false;
}

function startKeylogger() {
  if (state.status !== 'admitted') return;
  if (keyloggerActive) return;

  keylogger.start({
    onKey(ev) {
      if (ev.type === 'error') {
        keyloggerActive = false;
        if (state.socket?.connected) {
          state.socket.emit('student:keylogger-status', { active: false, error: ev.error });
        }
        return;
      }

      const now = Date.now();
      keyBuffer.push(ev);
      const cutoff = now - 180_000;
      while (keyBuffer.length > 0 && keyBuffer[0].t < cutoff) keyBuffer.shift();

      keystrokePending.push(ev);
      if (!keystrokeBatchTimer) {
        keystrokeBatchTimer = setTimeout(() => {
          keystrokeBatchTimer = null;
          if (keystrokePending.length > 0 && state.socket?.connected) {
            state.socket.emit('student:keystroke', { events: keystrokePending.splice(0) });
          } else {
            keystrokePending.length = 0;
          }
        }, 250);
      }
    },
  });

  keyloggerActive = true;
  if (state.socket?.connected) {
    state.socket.emit('student:keylogger-status', { active: true });
  }
  log('keylogger', 'started by teacher');
}

function stopKeylogger() {
  if (keystrokeBatchTimer) { clearTimeout(keystrokeBatchTimer); keystrokeBatchTimer = null; }
  keystrokePending.length = 0;
  keylogger.stop();
  if (keyloggerActive && state.socket?.connected) {
    state.socket.emit('student:keylogger-status', { active: false });
  }
  keyloggerActive = false;
}

async function closeSession(reason, { kill = true, killDelayMs = 2000 } = {}) {
  if (closingSession) return;
  closingSession = true;

  log('session', 'closing session:', reason);
  stopLiveStream();
  stopKeylogger();
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

function killSession(delayMs) {
  setTimeout(() => {
    try {
      execFileSync('loginctl', ['terminate-user', EXAM_USER], { stdio: 'pipe' });
    } catch {}
  }, delayMs);
}

function normalizeStreamConfig(streamConfig) {
  const intervalMs = Number(streamConfig?.intervalMs);
  const maxWidth = Number(streamConfig?.maxWidth);
  const maxHeight = Number(streamConfig?.maxHeight);

  return {
    intervalMs: Number.isFinite(intervalMs) && intervalMs > 0 ? intervalMs : LIVE_STREAM_INTERVAL_MS,
    maxWidth: Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : LIVE_STREAM_MAX_WIDTH,
    maxHeight: Number.isFinite(maxHeight) && maxHeight > 0 ? maxHeight : LIVE_STREAM_MAX_HEIGHT,
  };
}

// ── Start ─────────────────────────────────────────────────────────────────────

startBrowserWatchdog();

app.listen(7878, '127.0.0.1', () => log('daemon', 'listening on 127.0.0.1:7878'));
