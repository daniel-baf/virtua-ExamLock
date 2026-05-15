import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  connectTeacherSocket,
  disconnectSocket,
  getSessionSummary,
  kickStudent,
  listStudentScreenshots,
  listStudents,
  readmitStudent,
  requestAllScreenshots,
  requestScreenshot,
  sendStudentMessage,
  setWhitelist,
} from '../services/monitoringService';

export default function useMonitorSession(sessionId) {
  const [students, setStudents] = useState({});
  const [session, setSession] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const [connected, setConnected] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [tab, setTab] = useState('admitted');
  const [messageTarget, setMessageTarget] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [whitelistDomains, setWhitelistDomains] = useState([]);
  const [blockInternet, setBlockInternet] = useState(true);
  const [whitelistSaving, setWhitelistSaving] = useState(false);
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [captureAllBusy, setCaptureAllBusy] = useState(false);
  const [captureAllNote, setCaptureAllNote] = useState('');
  const [historyTarget, setHistoryTarget] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const [historyShots, setHistoryShots] = useState([]);
  const socketRef = useRef(null);
  const historyTargetRef = useRef(null);

  const patch = useCallback((uid, data) => {
    setStudents(prev => ({ ...prev, [uid]: { ...(prev[uid] ?? {}), uid, ...data } }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    setSessionLoading(true);
    setSessionError('');
    getSessionSummary(sessionId)
      .then(({ session: loadedSession }) => {
        if (cancelled) return;
        setSession(loadedSession);
        setWhitelistDomains(loadedSession.whitelist ?? []);
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
      socket.on('monitor:student-joined', ({ uid, name, status }) => patch(uid, { name, status: status ?? 'waiting' }));
      socket.on('monitor:screenshot-update', ({ uid, url }) => {
        const takenAt = Date.now();
        patch(uid, { screenUrl: url, lastScreenshotAt: takenAt, screenshotError: null });
        setHistoryShots(prev => {
          if (historyTargetRef.current?.uid !== uid || prev.some(sc => sc.url === url)) return prev;
          return [{ url, takenAt, type: 'screen', studentId: uid }, ...prev];
        });
      });
      socket.on('monitor:screenshot-error', ({ uid, error }) => patch(uid, { screenshotError: error }));
      socket.on('monitor:student-closed', ({ uid, reason }) => patch(uid, { status: 'closed', closeReason: reason }));
      socket.on('monitor:student-offline', ({ uid }) => patch(uid, { status: 'offline' }));
      socket.on('server:exam-ended', () => setExamEnded(true));
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [sessionId, patch]);

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

  async function sendMessage() {
    if (!messageText.trim() || !messageTarget) return;
    await sendStudentMessage(messageTarget, messageText);
    setMessageText('');
    setMessageTarget(null);
  }

  async function applyWhitelist() {
    setWhitelistSaving(true);
    try {
      await setWhitelist(sessionId, whitelistDomains, blockInternet);
      setSession(prev => prev
        ? { ...prev, whitelist: whitelistDomains, blockInternet }
        : prev);
    } finally {
      setWhitelistSaving(false);
    }
  }

  function endExam() {
    if (!confirm('Terminar el examen para todos?')) return;
    socketRef.current?.emit('teacher:end-exam');
    setExamEnded(true);
  }

  return {
    session,
    sessionLoading,
    sessionError,
    connected,
    examEnded,
    tab,
    messageTarget,
    messageText,
    whitelistDomains,
    blockInternet,
    whitelistSaving,
    showWhitelist,
    captureAllBusy,
    captureAllNote,
    historyTarget,
    historyLoading,
    historyError,
    historyShots,
    totals,
    studentsByTab,
    setTab,
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
    sendMessage,
    applyWhitelist,
    endExam,
  };
}
