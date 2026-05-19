import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  connectTeacherSocket,
  disconnectSocket,
  getNetworkDefaults,
  getSessionSummary,
  kickStudent,
  listStudentScreenshots,
  listStudents,
  readmitStudent,
  requestAllScreenshots,
  requestScreenshot,
  sendStudentMessage,
  setWhitelist,
} from '@monitoring/services/monitoringService';
import { activeDomainCount, mergeDomainLists, normalizeDomainList } from '@sessions';

export default function useMonitorSession(sessionId) {
  const [students, setStudents] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [connected, setConnected] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [whitelistDomains, setWhitelistDomains] = useState([]);
  const [blockInternet, setBlockInternet] = useState(true);
  const [whitelistSaving, setWhitelistSaving] = useState(false);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [captureAllBusy, setCaptureAllBusy] = useState(false);
  const [captureAllNote, setCaptureAllNote] = useState('');
  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyShots, setHistoryShots] = useState([]);
  const [liveTargetUid, setLiveTargetUid] = useState(null);
  const socketRef = useRef(null);
  const historyTargetRef = useRef(null);
  const studentsRef = useRef({});

  const patch = useCallback((uid, data) => {
    setStudents(prev => {
      const next = { ...prev, [uid]: { ...(prev[uid] ?? {}), uid, ...data } };
      studentsRef.current = next;
      return next;
    });
  }, []);

  const pushAlert = useCallback((alert) => {
    setAlerts(prev => {
      if (prev.some(item => item.dedupeKey === alert.dedupeKey)) return prev;
      return [{ ...alert, createdAt: Date.now() }, ...prev];
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    setSessionLoading(true);
    setSessionError('');
    getSessionSummary(sessionId)
      .then(({ session: loadedSession }) => {
        if (cancelled) return;
        setSession(loadedSession);
        setWhitelistDomains(normalizeDomainList(loadedSession.whitelist ?? []));
        setBlockInternet(loadedSession.blockInternet ?? true);
        setExamEnded(!loadedSession.active);
      })
      .catch(err => {
        if (!cancelled) setSessionError(`No se pudo cargar la sesion: ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setSessionLoading(false);
      });

    listStudents(sessionId)
      .then(({ students }) => {
        if (!cancelled) students.forEach(student => patch(student.uid, student));
      })
      .catch(console.error);

    connectTeacherSocket(sessionId).then(socket => {
      if (cancelled) return;
      socketRef.current = socket;
      setConnected(socket.connected);

      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
      socket.on('monitor:student-joined', ({ uid, name, status, lastHeartbeat, offlineAt }) => {
        patch(uid, { name, status: status ?? 'waiting', lastHeartbeat, offlineAt });
      });
      socket.on('monitor:screenshot-update', ({ uid, url }) => {
        const takenAt = Date.now();
        patch(uid, { screenUrl: url, lastScreenshotAt: takenAt, screenshotError: null });
        setHistoryShots(prev => {
          if (historyTargetRef.current?.uid !== uid || prev.some(sc => sc.url === url)) return prev;
          return [{ url, takenAt, type: 'screen', studentId: uid }, ...prev];
        });
      });
      socket.on('monitor:screenshot-error', ({ uid, error }) => {
        patch(uid, { screenshotError: error });
        pushAlert({
          id: `screenshot-error:${uid}:${Date.now()}`,
          dedupeKey: `screenshot-error:${uid}:${error}`,
          level: 'danger',
          studentUid: uid,
          studentLabel: labelForStudent(studentsRef.current[uid], uid),
          message: 'La captura de pantalla fallo y requiere revision.',
          meta: error,
        });
      });
      socket.on('monitor:stream-ready', ({ uid }) => patch(uid, { streamReady: true, streamStatus: 'ready' }));
      socket.on('monitor:stream-status', ({ uid, status, error }) => {
        patch(uid, { streamStatus: status, streamError: error ?? null });
      });
      socket.on('monitor:stream-started', ({ uid }) => {
        patch(uid, { streamStatus: 'live', streamError: null });
      });
      socket.on('monitor:stream-frame', ({ uid, jpegB64, takenAt }) => {
        patch(uid, {
          liveFrame: `data:image/jpeg;base64,${jpegB64}`,
          liveTakenAt: takenAt ?? Date.now(),
          streamStatus: 'live',
          streamError: null,
        });
      });
      socket.on('monitor:keystroke', ({ uid, events }) => {
        setStudents(prev => {
          const student = prev[uid] ?? { uid };
          const existing = student.keystrokes ?? [];
          const cutoff = Date.now() - 180_000;
          const merged = [...existing, ...events].filter(ev => ev.t >= cutoff);
          const next = { ...prev, [uid]: { ...student, keystrokes: merged } };
          studentsRef.current = next;
          return next;
        });
      });
      socket.on('monitor:keystroke-buffer', ({ uid, events }) => {
        patch(uid, { keystrokes: events ?? [] });
      });
      socket.on('monitor:keylogger-status', ({ uid, active }) => {
        patch(uid, { keyloggerActive: active });
      });
      socket.on('monitor:log', ({ uid, lines }) => {
        setStudents(prev => {
          const student = prev[uid] ?? { uid };
          const existing = student.daemonLogs ?? [];
          const merged = [...existing, ...lines].slice(-300);
          const next = { ...prev, [uid]: { ...student, daemonLogs: merged } };
          studentsRef.current = next;
          return next;
        });
      });
      socket.on('monitor:stream-error', ({ uid, error }) => {
        patch(uid, { streamStatus: 'error', streamError: error });
        pushAlert({
          id: `stream-error:${uid}:${Date.now()}`,
          dedupeKey: `stream-error:${uid}:${error}`,
          level: 'danger',
          studentUid: uid,
          studentLabel: labelForStudent(studentsRef.current[uid], uid),
          message: 'El stream del alumno reporto un error.',
          meta: error,
        });
      });
      socket.on('monitor:stream-stopped', ({ uid }) => {
        patch(uid, { streamStatus: 'ready' });
      });
      socket.on('monitor:student-closed', ({ uid, reason }) => patch(uid, { status: 'closed', closeReason: reason }));
      socket.on('monitor:student-offline', ({ uid, offlineAt }) => {
        const takenOfflineAt = offlineAt ?? Date.now();
        patch(uid, {
          status: 'offline',
          streamReady: false,
          streamStatus: 'offline',
          offlineAt: takenOfflineAt,
        });
        pushAlert({
          id: `offline:${uid}:${takenOfflineAt}`,
          dedupeKey: `offline:${uid}:${takenOfflineAt}`,
          level: 'warning',
          studentUid: uid,
          studentLabel: labelForStudent(studentsRef.current[uid], uid),
          message: 'El alumno se desconecto y quedo offline.',
          meta: `Detectado a las ${new Date(takenOfflineAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        });
      });
      socket.on('server:exam-ended', () => setExamEnded(true));
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [sessionId, patch, pushAlert]);

  const studentList = useMemo(() => Object.values(students), [students]);
  const totals = useMemo(() => ({
    all: studentList.length,
    active: studentList.filter(s => s.status === 'admitted').length,
    waiting: studentList.filter(s => s.status === 'waiting').length,
    alerts: studentList.filter(s => s.status === 'offline' || s.screenshotError).length,
  }), [studentList]);

  const studentsByTab = useMemo(() => ({
    admitted: studentList.filter(s => s.status === 'admitted' || s.status === 'offline' || s.status === 'waiting'),
    kicked: studentList.filter(s => s.status === 'kicked' || s.status === 'closed'),
  }), [studentList]);

  async function kick(uid) {
    if (!confirm('Expulsar a este alumno?')) return;
    await kickStudent(uid);
    patch(uid, { status: 'kicked', closeReason: 'expelled' });
  }

  async function readmit(uid) {
    await readmitStudent(uid);
    patch(uid, { status: 'admitted', closeReason: null });
  }

  async function capture(uid) {
    patch(uid, { screenshotError: null, screenshotPending: true });
    try {
      await requestScreenshot(uid);
    } finally {
      setTimeout(() => patch(uid, { screenshotPending: false }), 900);
    }
  }

  async function captureAll() {
    setCaptureAllBusy(true);
    setCaptureAllNote('');
    try {
      const res = await requestAllScreenshots(sessionId);
      setCaptureAllNote(`${res.requested} solicitadas, ${res.skipped} omitidas`);
    } catch (err) {
      setCaptureAllNote(err.message);
    } finally {
      setCaptureAllBusy(false);
      setTimeout(() => setCaptureAllNote(''), 5000);
    }
  }

  async function openHistory(student) {
    setHistoryTarget(student);
    historyTargetRef.current = student;
    setHistoryLoading(true);
    setHistoryError('');
    setHistoryShots([]);
    try {
      const { screenshots } = await listStudentScreenshots(student.uid);
      setHistoryShots(screenshots);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }

  function closeHistory() {
    historyTargetRef.current = null;
    setHistoryTarget(null);
  }

  function openLive(student) {
    setLiveTargetUid(student.uid);
    socketRef.current?.emit('teacher:request-keystroke-buffer', { uid: student.uid });
  }

  function toggleKeylogger(uid, active) {
    socketRef.current?.emit(active ? 'teacher:keylogger-start' : 'teacher:keylogger-stop', { uid });
  }

  function closeLive() {
    setLiveTargetUid(null);
  }

  async function sendMessage() {
    if (!messageText.trim() || !messageTarget) return;
    await sendStudentMessage(messageTarget, messageText);
    setMessageText('');
    setMessageTarget(null);
  }

  async function applyWhitelist() {
    setWhitelistSaving(true);
    try {
      const normalized = normalizeDomainList(whitelistDomains);
      await setWhitelist(sessionId, normalized, blockInternet);
      setSession(prev => prev
        ? { ...prev, whitelist: normalized, blockInternet }
        : prev);
    } finally {
      setWhitelistSaving(false);
    }
  }

  async function loadDefaultDomains() {
    setDefaultLoading(true);
    try {
      const { whitelist } = await getNetworkDefaults();
      setWhitelistDomains(current => mergeDomainLists(current, whitelist, 'default'));
    } finally {
      setDefaultLoading(false);
    }
  }

  function endExam() {
    if (!confirm('Terminar el examen para todos?')) return;
    socketRef.current?.emit('teacher:end-exam');
    setExamEnded(true);
  }

  const liveTarget = liveTargetUid ? students[liveTargetUid] ?? null : null;

  function acknowledgeAlert(alertId) {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }

  return {
    alerts,
    session,
    sessionLoading,
    sessionError,
    connected,
    examEnded,
    messageTarget,
    messageText,
    whitelistDomains,
    blockInternet,
    whitelistSaving,
    defaultLoading,
    showWhitelist,
    captureAllBusy,
    captureAllNote,
    historyTarget,
    historyLoading,
    historyError,
    historyShots,
    liveTarget,
    totals,
    activeWhitelistCount: activeDomainCount(whitelistDomains),
    studentsByTab,
    setMessageTarget,
    setMessageText,
    setWhitelistDomains,
    setBlockInternet,
    setShowWhitelist,
    captureAll,
    kick,
    readmit,
    capture,
    openHistory,
    closeHistory,
    openLive,
    closeLive,
    toggleKeylogger,
    acknowledgeAlert,
    sendMessage,
    applyWhitelist,
    loadDefaultDomains,
    endExam,
  };
}

function labelForStudent(student, uid) {
  return student?.email ?? student?.name ?? uid.slice(0, 8);
}
