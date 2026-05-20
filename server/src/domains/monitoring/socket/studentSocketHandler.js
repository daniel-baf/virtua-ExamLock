const { db, storage } = require('../../../firebase');
const { logEvent } = require('../../../events');
const { normalizeStreamConfig } = require('../../../monitoringConfig');
const { activeDomains } = require('../../../networkDefaults');
const { sessionTimePayload } = require('../../sessions/application/sessionService');
const { resetHeartbeat, clearTimer } = require('./heartbeatService');
const { scheduleSessionEnd } = require('./sessionEndService');
const keystrokeAudit = require('../keystrokeAuditStore');

async function handleStudentSocket(socket, sessionId, io, timers, sessionEndTimers) {
  const uid = socket.user.uid;
  socket.join(`student:${uid}`);
  socket.join(`session:${sessionId}`);

  resetHeartbeat(uid, sessionId, io, timers, socket.id, { replace: true });

  const [sessionSnap, studentSnap] = await Promise.all([
    db().collection('sessions').doc(sessionId).get(),
    db().collection('students').doc(uid).get(),
  ]);
  const session = sessionSnap.data() ?? {};
  const student = studentSnap.data() ?? {};

  const now = Date.now();
  await db().collection('students').doc(uid).update({
    status: 'admitted',
    lastHeartbeat: now,
    offlineAt: null,
  });

  io.to(`teachers:${sessionId}`).emit('monitor:student-joined', {
    uid,
    name: student.email ?? uid.slice(0, 8),
    status: 'admitted',
    lastHeartbeat: now,
    offlineAt: null,
  });

  socket.emit('server:admitted', {
    whitelist: activeDomains(session.whitelist ?? []),
    blockInternet: session.blockInternet ?? false,
    ...sessionTimePayload(session.endsAt),
    whitelistVersion: session.whitelistVersion ?? 0,
    streamConfig: normalizeStreamConfig(session.streamConfig),
  });

  if (session.active !== false && session.endsAt) {
    scheduleSessionEnd(sessionId, session.endsAt, io, sessionEndTimers);
  }

  if (teacherCount(io, sessionId) > 0) {
    io.to(`student:${uid}`).emit('server:monitor-start');
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid, status: 'connecting' });
  }

  socket.on('student:heartbeat', () => {
    if (!resetHeartbeat(uid, sessionId, io, timers, socket.id)) return;
    const heartbeatAt = Date.now();
    db().collection('students').doc(uid).update({
      status: 'admitted',
      lastHeartbeat: heartbeatAt,
      offlineAt: null,
    });
  });

  socket.on('student:screenshot', async ({ jpegB64, requestId }) => {
    const url = await uploadImage(jpegB64, `${sessionId}/${uid}/screen_${Date.now()}.jpg`);
    if (!url) {
      await logEvent(sessionId, 'screenshot-error', { requestId, error: 'upload_failed' }, uid);
      io.to(`teachers:${sessionId}`).emit('monitor:screenshot-error', { uid, error: 'upload_failed' });
      return;
    }
    await db().collection('students').doc(uid).update({ screenUrl: url, lastScreenshotAt: Date.now() });
    await db().collection('screenshots').add({ studentId: uid, sessionId, url, takenAt: Date.now(), type: 'screen' });
    await logEvent(sessionId, 'screenshot-received', { requestId, url }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:screenshot-update', { uid, url });
  });

  socket.on('student:screenshot-error', async ({ requestId, error }) => {
    const message = String(error ?? 'unknown_capture_error').slice(0, 500);
    await logEvent(sessionId, 'screenshot-error', { requestId, error: message }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:screenshot-error', { uid, error: message });
  });

  socket.on('student:stream-ready', async () => {
    const streamReadyAt = Date.now();
    await db().collection('students').doc(uid).update({ streamReady: true, streamReadyAt });
    await logEvent(sessionId, 'stream-ready', { streamReadyAt }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-ready', { uid });
  });

  socket.on('student:stream-started', async () => {
    await logEvent(sessionId, 'stream-started', { startedAt: Date.now() }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-started', { uid });
  });

  socket.on('student:monitor-frame', (jpegBuf, meta) => {
    if (!jpegBuf) return;
    io.to(`teachers:${sessionId}`).emit('monitor:stream-frame', jpegBuf, { uid, takenAt: meta?.takenAt ?? Date.now() });
  });

  socket.on('student:log', ({ lines }) => {
    if (!Array.isArray(lines) || lines.length === 0) return;
    io.to(`teachers:${sessionId}`).emit('monitor:log', { uid, lines });
  });

  socket.on('student:keystroke', ({ events }) => {
    if (!Array.isArray(events) || events.length === 0) return;
    const serverReceivedAt = Date.now();
    io.to(`teachers:${sessionId}`).emit('monitor:keystroke', {
      uid,
      events: normalizeKeystrokeEvents(events, serverReceivedAt),
      serverReceivedAt,
    });
  });

  socket.on('student:keystroke-chunk', ({ text, startedAt, endedAt }) => {
    if (!text) return;
    const chunk = { text, startedAt, endedAt };
    keystrokeAudit.appendChunk(sessionId, uid, chunk);
    io.to(`teachers:${sessionId}`).emit('monitor:keystroke-chunk', { uid, chunk });
  });

  socket.on('student:stream-error', async ({ error }) => {
    const message = String(error ?? 'unknown_stream_error').slice(0, 500);
    await logEvent(sessionId, 'stream-error', { error: message }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-error', { uid, error: message });
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid, status: 'error', error: message });
  });

  socket.on('student:stream-stopped', async () => {
    await logEvent(sessionId, 'stream-stopped', { stoppedAt: Date.now() }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:stream-stopped', { uid });
    io.to(`teachers:${sessionId}`).emit('monitor:stream-status', { uid, status: 'ready' });
  });

  socket.on('student:closed', async ({ reason }) => {
    const current = timers.get(uid);
    if (current && current.socketId !== socket.id) return;
    clearTimer(uid, timers);
    await db().collection('students').doc(uid).update({
      status: 'closed',
      closedAt: Date.now(),
      closeReason: reason ?? 'unknown',
    });
    await logEvent(sessionId, 'closed', { reason }, uid);
    io.to(`teachers:${sessionId}`).emit('monitor:student-closed', { uid, reason });
  });
}

function teacherCount(io, sessionId) {
  return io.sockets.adapter.rooms.get(`teachers:${sessionId}`)?.size ?? 0;
}

function normalizeKeystrokeEvents(events, receivedAt) {
  const safeEvents = events.filter(event => event && typeof event === 'object');
  const firstClientTs = safeEvents.find(event => Number.isFinite(Number(event.t)))?.t;
  const firstClientTime = Number(firstClientTs);

  return safeEvents.map((event, index) => {
    const clientTime = Number(event.t);
    const offset = Number.isFinite(clientTime) && Number.isFinite(firstClientTime)
      ? Math.max(0, Math.min(clientTime - firstClientTime, 1000))
      : index;

    return {
      ...event,
      clientT: event.t ?? null,
      t: receivedAt + offset,
    };
  });
}

async function uploadImage(jpegB64, filePath) {
  try {
    const buffer = Buffer.from(jpegB64, 'base64');
    const file = storage().file(filePath);
    await file.save(buffer, { contentType: 'image/jpeg', resumable: false });
    return `https://storage.googleapis.com/${process.env.GCS_BUCKET}/${filePath}`;
  } catch (err) {
    console.error('[upload] failed:', err.message);
    return null;
  }
}

module.exports = { handleStudentSocket };
