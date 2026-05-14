import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { connectTeacherSocket, disconnectSocket } from '../lib/socket';
import { api } from '../lib/api';
import DomainList from '../components/DomainList';
import AuthImage from '../components/AuthImage';

const TAB_LABELS = { admitted: 'En curso', kicked: 'Cerrados' };
const STATUS_META = {
  waiting:  { label: 'Esperando', dot: 'bg-amber-400', border: 'border-amber-700/50' },
  admitted: { label: 'Activo', dot: 'bg-emerald-400', border: 'border-emerald-700/60' },
  offline:  { label: 'Offline', dot: 'bg-zinc-400', border: 'border-zinc-700' },
  kicked:   { label: 'Expulsado', dot: 'bg-rose-500', border: 'border-rose-800/70' },
  closed:   { label: 'Cerrado', dot: 'bg-zinc-500', border: 'border-zinc-700' },
};

function fmtTime(ts) {
  if (!ts) return 'Sin registro';
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function closeReasonLabel(reason) {
  const map = {
    browser_closed: 'Cerro el navegador',
    submitted: 'Finalizo el examen',
    expelled: 'Expulsado por docente',
  };
  return map[reason] ?? reason;
}

export default function Monitor() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState({});
  const [connected, setConnected] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const [tab, setTab] = useState('admitted');
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgText, setMsgText] = useState('');
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

    api.listStudents(sessionId)
      .then(({ students }) => {
        if (cancelled) return;
        students.forEach(s => patch(s.uid, s));
      })
      .catch(console.error);

    connectTeacherSocket(sessionId).then(socket => {
      if (cancelled) return;
      socketRef.current = socket;
      setConnected(socket.connected);

      socket.on('connect',    () => { setConnected(true); });
      socket.on('disconnect', () => setConnected(false));

      socket.on('monitor:student-joined', ({ uid, name, status }) => patch(uid, { name, status: status ?? 'waiting' }));
      socket.on('monitor:screenshot-update', ({ uid, url }) => {
        const takenAt = Date.now();
        patch(uid, { screenUrl: url, lastScreenshotAt: takenAt, screenshotError: null });
        setHistoryShots(prev => {
          if (historyTargetRef.current?.uid !== uid) return prev;
          if (prev.some(sc => sc.url === url)) return prev;
          return [{ url, takenAt, type: 'screen', studentId: uid }, ...prev];
        });
      });
      socket.on('monitor:screenshot-error', ({ uid, error }) => patch(uid, { screenshotError: error }));
      socket.on('monitor:student-closed', ({ uid, reason }) => patch(uid, { status: 'closed', closeReason: reason }));
      socket.on('monitor:student-offline', ({ uid }) => patch(uid, { status: 'offline' }));
      socket.on('server:exam-ended', () => setExamEnded(true));
    });

    return () => { cancelled = true; disconnectSocket(); };
  }, [sessionId, patch]);

  async function handleKick(uid) {
    if (!confirm('Expulsar a este alumno?')) return;
    await api.kick(uid, 'expelled');
    patch(uid, { status: 'kicked', closeReason: 'expelled' });
  }

  async function handleReadmit(uid) {
    await api.readmit(uid);
    patch(uid, { status: 'admitted', closeReason: null });
  }

  async function handleScreenshot(uid) {
    patch(uid, { screenshotError: null, screenshotPending: true });
    try {
      await api.requestScreenshot(uid);
    } finally {
      setTimeout(() => patch(uid, { screenshotPending: false }), 900);
    }
  }

  async function handleCaptureAll() {
    setCaptureAllBusy(true);
    setCaptureAllNote('');
    try {
      const res = await api.requestAllScreenshots(sessionId);
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
      const { screenshots } = await api.listStudentScreenshots(student.uid);
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
    if (!msgText.trim() || !msgTarget) return;
    await api.sendMessage(msgTarget, msgText);
    setMsgText('');
    setMsgTarget(null);
  }

  async function applyWhitelist() {
    setWhitelistSaving(true);
    try {
      await api.setWhitelist(sessionId, whitelistDomains, blockInternet);
    } finally {
      setWhitelistSaving(false);
    }
  }

  async function handleEndExam() {
    if (!confirm('Terminar el examen para todos?')) return;
    socketRef.current?.emit('teacher:end-exam');
    setExamEnded(true);
  }

  const list = Object.values(students);
  const totals = {
    all: list.length,
    active: list.filter(s => s.status === 'admitted').length,
    waiting: list.filter(s => s.status === 'waiting').length,
    alerts: list.filter(s => s.status === 'offline' || s.screenshotError).length,
  };
  const byTab = {
    admitted: list.filter(s => s.status === 'admitted' || s.status === 'offline' || s.status === 'waiting'),
    kicked:   list.filter(s => s.status === 'kicked' || s.status === 'closed'),
  };

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800/80 bg-[#0d0f12]/95 px-5 py-3 shrink-0">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link to="/dashboard" className="text-zinc-500 hover:text-zinc-200 text-sm">Volver</Link>
            <div className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-wide">Monitor de examen</h1>
              <p className="text-xs text-zinc-500 truncate">
                {connected ? 'Canal docente conectado' : 'Canal docente desconectado'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Metric label="Total" value={totals.all} />
            <Metric label="Activos" value={totals.active} tone="emerald" />
            <Metric label="Alertas" value={totals.alerts} tone="amber" />
            <button onClick={handleCaptureAll} disabled={captureAllBusy || totals.active === 0}
              className="h-9 rounded-md border border-sky-700/70 bg-sky-950/70 px-3 text-xs font-medium text-sky-200
                hover:bg-sky-900 disabled:opacity-40">
              {captureAllBusy ? 'Solicitando...' : 'Capturar todos'}
            </button>
            <button onClick={() => setShowWhitelist(v => !v)}
              className="h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-xs font-medium text-zinc-200 hover:bg-zinc-800">
              Red
            </button>
            <button onClick={handleEndExam} disabled={examEnded}
              className="h-9 rounded-md border border-rose-800 bg-rose-950/80 px-3 text-xs font-medium text-rose-200
                hover:bg-rose-900 disabled:opacity-40">
              {examEnded ? 'Terminado' : 'Terminar'}
            </button>
          </div>
        </div>
        {captureAllNote && <p className="mt-2 text-right text-xs text-zinc-500">{captureAllNote}</p>}
      </header>

      {showWhitelist && (
        <div className="border-b border-zinc-800 bg-[#111318] px-5 py-4">
          <div className="mx-auto max-w-6xl space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium">Control de red</h3>
                <p className="text-xs text-zinc-500">Aplica cambios a los alumnos conectados.</p>
              </div>
              <button onClick={() => setBlockInternet(v => !v)}
                className={`h-8 rounded-md px-3 text-xs font-medium ${blockInternet
                  ? 'bg-amber-950 text-amber-200 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-200 border border-emerald-800'}`}>
                {blockInternet ? 'Internet restringido' : 'Internet libre'}
              </button>
            </div>
            {blockInternet && <DomainList domains={whitelistDomains} onChange={setWhitelistDomains} />}
            <button onClick={applyWhitelist} disabled={whitelistSaving}
              className="h-9 rounded-md bg-zinc-100 px-4 text-xs font-semibold text-zinc-950 hover:bg-white disabled:opacity-50">
              {whitelistSaving ? 'Aplicando...' : 'Aplicar red'}
            </button>
          </div>
        </div>
      )}

      {examEnded && (
        <div className="border-b border-rose-900 bg-rose-950/50 px-5 py-2 text-center text-sm text-rose-200">
          Examen terminado.{' '}
          <button onClick={() => navigate(`/session/${sessionId}/audit`)} className="underline hover:text-white">
            Ver auditoria
          </button>
        </div>
      )}

      <div className="border-b border-zinc-800 px-5">
        <div className="flex gap-1">
          {Object.entries(TAB_LABELS).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors
                ${tab === key ? 'border-zinc-100 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-200'}`}>
              {label}
              <span className="ml-2 rounded bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-400">
                {byTab[key].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-auto p-4">
        {byTab[tab].length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-zinc-600">Sin alumnos en esta categoria.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {byTab[tab].map(s => (
              <StudentCard key={s.uid} student={s} tab={tab}
                onHistory={() => openHistory(s)}
                onKick={() => handleKick(s.uid)}
                onReadmit={() => handleReadmit(s.uid)}
                onScreenshot={() => handleScreenshot(s.uid)}
                onMessage={() => setMsgTarget(s.uid)} />
            ))}
          </div>
        )}
      </main>

      {msgTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-lg border border-zinc-700 bg-[#101216] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold">Enviar mensaje</h3>
            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={3}
              placeholder="Mensaje para el alumno..." autoFocus
              className="mt-4 w-full resize-none rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white
                focus:border-sky-500 focus:outline-none" />
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setMsgTarget(null); setMsgText(''); }}
                className="flex-1 rounded-md bg-zinc-800 py-2 text-sm hover:bg-zinc-700">Cancelar</button>
              <button onClick={sendMessage}
                className="flex-1 rounded-md bg-zinc-100 py-2 text-sm font-semibold text-zinc-950 hover:bg-white">Enviar</button>
            </div>
          </div>
        </div>
      )}

      {historyTarget && (
        <HistoryPanel student={historyTarget}
          screenshots={historyShots}
          loading={historyLoading}
          error={historyError}
          onClose={closeHistory}
          onCapture={() => handleScreenshot(historyTarget.uid)} />
      )}
    </div>
  );
}

function Metric({ label, value, tone = 'zinc' }) {
  const toneClass = tone === 'emerald' ? 'text-emerald-300' : tone === 'amber' ? 'text-amber-300' : 'text-zinc-200';
  return (
    <div className="h-9 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5">
      <span className={`mr-2 text-sm font-semibold ${toneClass}`}>{value}</span>
      <span className="text-[11px] text-zinc-500">{label}</span>
    </div>
  );
}

function StudentCard({ student, tab, onKick, onReadmit, onScreenshot, onMessage, onHistory }) {
  const { uid, status = 'waiting', screenUrl, email, name } = student;
  const meta = STATUS_META[status] ?? STATUS_META.offline;
  const label = email ?? name ?? uid.slice(0, 8);
  const closeLabel = closeReasonLabel(student.closeReason);

  return (
    <article className={`overflow-hidden rounded-lg border ${meta.border} bg-[#101216] shadow-sm`}>
      <button onClick={onHistory} className="block w-full text-left">
        <div className="relative aspect-video bg-zinc-950">
          {screenUrl
            ? <AuthImage uid={uid} src={screenUrl} alt="pantalla" className="grid h-full w-full place-items-center object-cover text-xs text-zinc-600" />
            : <div className="grid h-full place-items-center text-xs text-zinc-600">Sin captura</div>
          }
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded bg-black/70 px-2 py-1 text-[11px] text-zinc-200">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </div>
          {student.screenshotPending && (
            <div className="absolute inset-0 grid place-items-center bg-black/50 text-xs text-zinc-200">
              Solicitando captura...
            </div>
          )}
        </div>
      </button>

      <div className="space-y-3 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-100" title={label}>{label}</p>
          <p className="text-[11px] text-zinc-500">Ultima captura: {fmtTime(student.lastScreenshotAt)}</p>
          {student.attempts > 0 && <p className="text-[11px] text-amber-300">{student.attempts} reingreso(s)</p>}
          {status === 'closed' && closeLabel && <p className="truncate text-[11px] text-zinc-500">{closeLabel}</p>}
          {student.screenshotError && (
            <p className="truncate text-[11px] text-rose-300" title={student.screenshotError}>Error de captura</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button onClick={onHistory}
            className="rounded-md border border-zinc-700 bg-zinc-900 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800">
            Historial
          </button>
          {tab === 'admitted' && (
            <>
              <button onClick={onScreenshot}
                className="rounded-md border border-sky-800 bg-sky-950 py-1.5 text-xs text-sky-200 hover:bg-sky-900">
                Capturar
              </button>
              <button onClick={onMessage}
                className="rounded-md border border-zinc-700 bg-zinc-900 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800">
                Mensaje
              </button>
              <button onClick={onKick}
                className="col-span-3 rounded-md border border-rose-800 bg-rose-950/70 py-1.5 text-xs text-rose-200 hover:bg-rose-900">
                Expulsar
              </button>
            </>
          )}
          {tab === 'kicked' && (
            <button onClick={onReadmit}
              className="col-span-2 rounded-md border border-sky-800 bg-sky-950 py-1.5 text-xs text-sky-200 hover:bg-sky-900">
              Readmitir
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function HistoryPanel({ student, screenshots, loading, error, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/65">
      <aside className="h-full w-full max-w-3xl overflow-y-auto border-l border-zinc-800 bg-[#0d0f12] shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0d0f12]/95 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{label}</p>
              <p className="text-xs text-zinc-500">{screenshots.length} capturas registradas</p>
            </div>
            <div className="flex gap-2">
              <button onClick={onCapture}
                className="rounded-md border border-sky-800 bg-sky-950 px-3 py-2 text-xs text-sky-200 hover:bg-sky-900">
                Capturar ahora
              </button>
              <button onClick={onClose}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800">
                Cerrar
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading && <div className="grid h-48 place-items-center text-sm text-zinc-500">Cargando historial...</div>}
          {error && <div className="rounded-md border border-rose-900 bg-rose-950/60 p-3 text-sm text-rose-200">{error}</div>}
          {!loading && !error && screenshots.length === 0 && (
            <div className="grid h-48 place-items-center rounded-lg border border-dashed border-zinc-800 text-sm text-zinc-600">
              Sin capturas para este alumno.
            </div>
          )}
          {!loading && !error && screenshots.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {screenshots.map((sc, index) => (
                <div key={sc.id ?? `${sc.url}-${index}`}
                  className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 hover:border-sky-700">
                  <AuthImage uid={student.uid} src={sc.url} alt={`captura ${index + 1}`}
                    className="grid aspect-video w-full place-items-center object-cover text-xs text-zinc-600" />
                  <div className="flex items-center justify-between px-3 py-2 text-xs text-zinc-500">
                    <span>{fmtTime(sc.takenAt)}</span>
                    <span className="text-zinc-600 group-hover:text-sky-300">Vista protegida</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
