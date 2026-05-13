import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { connectTeacherSocket, disconnectSocket } from '../lib/socket';
import { api } from '../lib/api';
import DomainList from '../components/DomainList';

const TAB_LABELS = { admitted: 'Activos', kicked: 'Expulsados' };
const STATUS_COLOR = {
  waiting:  'bg-yellow-500',
  admitted: 'bg-green-500',
  offline:  'bg-gray-500',
  kicked:   'bg-red-500',
  closed:   'bg-gray-600',
};

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
  const socketRef = useRef(null);

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

      socket.on('monitor:student-joined',    ({ uid, name, status }) => patch(uid, { name, status: status ?? 'waiting' }));
      socket.on('monitor:screenshot-update', ({ uid, url }) => patch(uid, { screenUrl: url }));
      socket.on('monitor:student-closed',    ({ uid }) => patch(uid, { status: 'closed' }));
      socket.on('monitor:student-offline',   ({ uid }) => patch(uid, { status: 'offline' }));
      socket.on('server:exam-ended',         () => setExamEnded(true));
    });

    return () => { cancelled = true; disconnectSocket(); };
  }, [sessionId, patch]);

  async function handleKick(uid) {
    if (!confirm('¿Expulsar a este alumno?')) return;
    await api.kick(uid, 'expelled');
    patch(uid, { status: 'kicked' });
  }

  async function handleReadmit(uid) {
    await api.readmit(uid);
    patch(uid, { status: 'admitted' });
  }

  async function handleScreenshot(uid) {
    await api.requestScreenshot(uid);
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
    if (!confirm('¿Terminar el examen para todos?')) return;
    socketRef.current?.emit('teacher:end-exam');
    setExamEnded(true);
  }

  const list = Object.values(students);
  const byTab = {
    admitted: list.filter(s => s.status === 'admitted' || s.status === 'offline' || s.status === 'waiting'),
    kicked:   list.filter(s => s.status === 'kicked' || s.status === 'closed'),
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Volver</Link>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-400">{connected ? 'Conectado' : 'Desconectado'}</span>
        </div>

        {/* Whitelist toggle */}
        <button
          onClick={() => setShowWhitelist(v => !v)}
          className="text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
          Whitelist
        </button>

        <button onClick={handleEndExam} disabled={examEnded}
          className="text-sm bg-red-900 hover:bg-red-800 border border-red-700 px-3 py-1.5 rounded-lg
            transition-colors disabled:opacity-40 shrink-0">
          {examEnded ? 'Terminado' : 'Terminar examen'}
        </button>
      </header>

      {showWhitelist && (
        <div className="border-b border-gray-800 bg-gray-900 px-6 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-200">Control de acceso a internet</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-400">{blockInternet ? 'Restringido' : 'Libre'}</span>
              <div onClick={() => setBlockInternet(v => !v)}
                className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors
                  ${blockInternet ? 'bg-violet-600' : 'bg-gray-700'}`}>
                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform
                  ${blockInternet ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </label>
          </div>
          {blockInternet && (
            <DomainList domains={whitelistDomains} onChange={setWhitelistDomains} />
          )}
          <button onClick={applyWhitelist} disabled={whitelistSaving}
            className="text-xs bg-violet-700 hover:bg-violet-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {whitelistSaving ? 'Aplicando…' : 'Aplicar a todos'}
          </button>
        </div>
      )}

      {examEnded && (
        <div className="bg-red-950 border-b border-red-800 px-6 py-2 text-sm text-red-300 text-center">
          Examen terminado.{' '}
          <button onClick={() => navigate(`/session/${sessionId}/audit`)} className="underline hover:text-red-200">
            Ver auditoría
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-800 px-6 flex gap-1">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors
              ${tab === key
                ? 'border-violet-500 text-violet-400'
                : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
            {label}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full
              ${tab === key ? 'bg-violet-900 text-violet-300' : 'bg-gray-800 text-gray-500'}`}>
              {byTab[key].length}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 p-4 overflow-auto">
        {byTab[tab].length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Sin alumnos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {byTab[tab].map(s => (
              <StudentCard key={s.uid} student={s}
                tab={tab}
                onKick={() => handleKick(s.uid)}
                onReadmit={() => handleReadmit(s.uid)}
                onScreenshot={() => handleScreenshot(s.uid)}
                onMessage={() => setMsgTarget(s.uid)} />
            ))}
          </div>
        )}
      </div>

      {/* Message modal */}
      {msgTarget && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5 w-full max-w-sm space-y-4">
            <h3 className="font-medium">Enviar mensaje</h3>
            <textarea value={msgText} onChange={e => setMsgText(e.target.value)} rows={3}
              placeholder="Mensaje para el alumno…" autoFocus
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm
                resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <div className="flex gap-2">
              <button onClick={() => { setMsgTarget(null); setMsgText(''); }}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded-lg">Cancelar</button>
              <button onClick={sendMessage}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-sm py-2 rounded-lg">Enviar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentCard({ student, tab, onKick, onReadmit, onScreenshot, onMessage }) {
  const { uid, status = 'waiting', screenUrl, email, name } = student;
  const label = email ?? name ?? uid.slice(0, 8);

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden
      ${status === 'kicked' || status === 'closed' ? 'border-red-800'
        : status === 'offline' ? 'border-yellow-800'
        : status === 'admitted' ? 'border-green-900'
        : 'border-gray-800'}`}>

      {/* Screen thumbnail */}
      <div className="aspect-video bg-gray-800 relative">
        {screenUrl
          ? <img src={screenUrl} alt="pantalla" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">Sin captura</div>
        }
        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${STATUS_COLOR[status] ?? 'bg-gray-500'}`} />
      </div>

      {/* Info */}
      <div className="p-2.5 space-y-2">
        <p className="text-xs font-medium truncate" title={label}>{label}</p>
        {student.attempts > 0 && (
          <p className="text-xs text-gray-500">{student.attempts} reingreso(s)</p>
        )}

        {/* Actions */}
        <div className="flex gap-1 flex-wrap">
          {tab === 'admitted' && (
            <>
              <button onClick={onScreenshot}
                className="flex-1 text-xs bg-indigo-900 hover:bg-indigo-800 border border-indigo-700
                  py-1 rounded transition-colors">
                📸
              </button>
              <button onClick={onKick}
                className="flex-1 text-xs bg-red-950 hover:bg-red-900 border border-red-800
                  py-1 rounded transition-colors text-red-400">
                Expulsar
              </button>
              <button onClick={onMessage}
                className="px-2 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded">
                ✉
              </button>
            </>
          )}
          {tab === 'kicked' && (
            <button onClick={onReadmit}
              className="flex-1 text-xs bg-blue-900 hover:bg-blue-800 border border-blue-700
                py-1 rounded transition-colors">
              Readmitir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
