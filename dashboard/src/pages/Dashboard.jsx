import { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';

// Sessions are stored locally for the POC (no list endpoint yet)
// In production, add GET /api/sessions to server
const STORAGE_KEY = 'examlock:sessions';

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}

export function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export default function Dashboard() {
  const [sessions, setSessions] = useState(loadSessions);
  const navigate = useNavigate();

  useEffect(() => {
    const updated = loadSessions();
    setSessions(updated);
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="font-semibold">ExamLock</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{auth.currentUser?.email}</span>
          <button onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-white transition-colors">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Sesiones</h2>
          <Link to="/session/new"
            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium
              px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            <span>+</span> Nueva sesión
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Sin sesiones aún.</p>
            <p className="text-sm mt-1">Crea una para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...sessions].reverse().map(s => (
              <div key={s.sessionId}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Código: <code className="font-mono text-violet-400">{s.code}</code>
                    {' · '}
                    {new Date(s.createdAt).toLocaleDateString('es', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/session/${s.sessionId}/monitor`}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    Monitor
                  </Link>
                  <Link to={`/session/${s.sessionId}/results`}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    Resultados
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
