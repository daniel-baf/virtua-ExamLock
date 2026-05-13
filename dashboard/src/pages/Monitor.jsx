import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { connectTeacherSocket, disconnectSocket } from '../lib/socket';
import { api } from '../lib/api';

const STATUS_LABEL = { active: 'activo', offline: 'offline', closed: 'cerrado', reactivating: 'reactivando' };
const STATUS_COLOR = {
  active: 'bg-green-500',
  offline: 'bg-yellow-500',
  closed: 'bg-red-500',
  reactivating: 'bg-blue-500',
};

export default function Monitor() {
  const { id: sessionId } = useParams();
  const [students, setStudents] = useState({});
  const [connected, setConnected] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgText, setMsgText] = useState('');
  const socketRef = useRef(null);

  const patchStudent = useCallback((studentId, patch) => {
    setStudents(prev => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? {}), studentId, ...patch },
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    connectTeacherSocket(sessionId).then(socket => {
      if (cancelled) return;
      socketRef.current = socket;
      setConnected(socket.connected);

      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));

      socket.on('monitor:student-joined', ({ studentId }) => patchStudent(studentId, { status: 'active' }));
      socket.on('monitor:screenshot-update', ({ studentId, url }) => patchStudent(studentId, { screenUrl: url }));
      socket.on('monitor:camera-update', ({ studentId, url }) => patchStudent(studentId, { cameraUrl: url }));
      socket.on('monitor:student-closed', ({ studentId, reason }) => patchStudent(studentId, { status: 'closed', closeReason: reason }));
      socket.on('monitor:student-offline', ({ studentId }) => patchStudent(studentId, { status: 'offline' }));
    });
    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [sessionId, patchStudent]);

  async function handleBlock(studentId, blocked) {
    await (blocked ? api.blockInternet(studentId) : api.unblockInternet(studentId));
    patchStudent(studentId, { internetBlocked: blocked });
  }

  async function handleReactivate(studentId) {
    await api.reactivateStudent(studentId);
    patchStudent(studentId, { status: 'reactivating' });
  }

  async function handleEndExam() {
    socketRef.current?.emit('teacher:end-exam');
  }

  async function sendMessage() {
    if (!msgText.trim() || !msgTarget) return;
    await api.sendMessage(msgTarget, msgText);
    setMsgText('');
    setMsgTarget(null);
  }

  const studentList = Object.values(students);
  const active = studentList.filter(s => s.status === 'active').length;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Volver</Link>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">{connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            <span className="text-green-400 font-medium">{active}</span> activos
            {' / '}
            <span className="font-medium">{studentList.length}</span> total
          </span>
          <button onClick={handleEndExam}
            className="text-sm bg-red-900 hover:bg-red-800 border border-red-700 px-3 py-1.5 rounded-lg transition-colors">
            Terminar examen
          </button>
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 p-4 overflow-auto">
        {studentList.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-600">
            <p>Esperando alumnos…</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {studentList.map(s => (
              <StudentCard key={s.studentId} student={s}
                onBlock={() => handleBlock(s.studentId, !s.internetBlocked)}
                onReactivate={() => handleReactivate(s.studentId)}
                onMessage={() => setMsgTarget(s.studentId)} />
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
              placeholder="Mensaje para el alumno…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm
                resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
            <div className="flex gap-2">
              <button onClick={() => setMsgTarget(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-sm py-2 rounded-lg transition-colors">
                Cancelar
              </button>
              <button onClick={sendMessage}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-sm py-2 rounded-lg transition-colors">
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StudentCard({ student, onBlock, onReactivate, onMessage }) {
  const { studentId, status = 'active', screenUrl, cameraUrl, internetBlocked, closeReason } = student;
  const name = student.name ?? studentId.slice(0, 8);

  return (
    <div className={`bg-gray-900 border rounded-xl overflow-hidden
      ${status === 'closed' ? 'border-red-800' : status === 'offline' ? 'border-yellow-800' : 'border-gray-800'}`}>
      {/* Screen thumbnail */}
      <div className="aspect-video bg-gray-800 relative">
        {screenUrl
          ? <img src={screenUrl} alt="pantalla" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
              Sin captura
            </div>
        }
        {/* Camera pip */}
        {cameraUrl && (
          <img src={cameraUrl} alt="cámara"
            className="absolute bottom-1 right-1 w-12 h-9 object-cover rounded border border-gray-700" />
        )}
        {status === 'closed' && (
          <div className="absolute inset-0 bg-red-950/80 flex flex-col items-center justify-center">
            <span className="text-2xl">⚠</span>
            <span className="text-xs text-red-300 mt-1">{closeReason ?? 'cerrado'}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <div className="flex items-center gap-1.5 mb-2">
          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_COLOR[status] ?? 'bg-gray-500'}`} />
          <span className="text-xs font-medium truncate flex-1">{name}</span>
          <span className="text-xs text-gray-500">{STATUS_LABEL[status] ?? status}</span>
        </div>

        {/* Controls */}
        <div className="flex gap-1">
          {status === 'closed' || status === 'offline' ? (
            <button onClick={onReactivate}
              className="flex-1 text-xs bg-blue-900 hover:bg-blue-800 border border-blue-700
                py-1 rounded transition-colors">
              Reactivar
            </button>
          ) : (
            <button onClick={onBlock}
              className={`flex-1 text-xs py-1 rounded border transition-colors
                ${internetBlocked
                  ? 'bg-orange-950 border-orange-800 hover:bg-orange-900 text-orange-300'
                  : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
              {internetBlocked ? 'Desbloquear' : 'Bloquear red'}
            </button>
          )}
          <button onClick={onMessage}
            className="px-2 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700
              rounded transition-colors">
            ✉
          </button>
        </div>
      </div>
    </div>
  );
}
