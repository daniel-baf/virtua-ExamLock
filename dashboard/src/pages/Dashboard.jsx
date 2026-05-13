import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { sessions } = await api.listSessions();
      setSessions(sessions);
    } catch (e) {
      setError('No se pudieron cargar las sesiones: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialSessions() {
      try {
        const { sessions } = await api.listSessions();
        if (cancelled) return;
        setSessions(sessions);
      } catch (e) {
        if (cancelled) return;
        setError('No se pudieron cargar las sesiones: ' + e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialSessions();
    return () => { cancelled = true; };
  }, []);

  async function handleSignOut() {
    await signOut(auth);
    navigate('/');
  }

  async function handleResetDb() {
    if (!confirm('Borrar TODOS los datos (sesiones, estudiantes, respuestas, preguntas)?')) return;
    setResetting(true);
    try {
      await api.resetDb();
      setSessions([]);
    } catch (e) {
      alert('Error al resetear: ' + e.message);
    } finally {
      setResetting(false);
    }
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
          <button onClick={fetchSessions} disabled={loading}
            className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500
              px-3 py-1 rounded-lg transition-colors disabled:opacity-40">
            {loading ? 'Cargando…' : 'Actualizar'}
          </button>
          <button onClick={handleResetDb} disabled={resetting}
            className="text-sm text-red-500 hover:text-red-400 border border-red-800 hover:border-red-600
              px-3 py-1 rounded-lg transition-colors disabled:opacity-40">
            {resetting ? 'Borrando…' : 'Reset DB'}
          </button>
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

        {error && (
          <div className="mb-4 bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <p>Cargando sesiones…</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">Sin sesiones aún.</p>
            <p className="text-sm mt-1">Crea una para comenzar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map(s => (
              <div key={s.sessionId}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{s.name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${s.active ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                      {s.active ? 'activa' : 'terminada'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${s.blockInternet ? 'bg-violet-900 text-violet-300' : 'bg-gray-800 text-gray-300'}`}>
                      {s.blockInternet ? 'internet restringido' : 'internet libre'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Código: <code className="font-mono text-violet-400">{s.code}</code>
                    {' · '}
                    {new Date(s.createdAt).toLocaleDateString('es', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link to={`/session/${s.sessionId}/monitor`}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    Monitor
                  </Link>
                  <Link to={`/session/${s.sessionId}/audit`}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                    Auditoría
                  </Link>
                </div>
                </div>

                <SessionWhitelistTable session={s} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function SessionWhitelistTable({ session }) {
  const domains = session.whitelist ?? [];

  if (!session.blockInternet) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-4 py-3 text-sm text-gray-400">
        Esta sesi\u00f3n tiene acceso libre a internet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950/50">
      <div className="border-b border-gray-800 px-4 py-3">
        <p className="text-sm font-medium text-gray-200">Dominios permitidos</p>
        <p className="text-xs text-gray-500 mt-1">
          {domains.length > 0 ? `${domains.length} dominio(s) configurado(s)` : 'Sin dominios configurados; el bloqueo es total.'}
        </p>
      </div>

      {domains.length === 0 ? (
        <div className="px-4 py-4 text-sm text-gray-500">No hay dominios permitidos para esta sesi\u00f3n.</div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-900/80 text-gray-400">
            <tr>
              <th className="px-4 py-2 text-left font-medium">#</th>
              <th className="px-4 py-2 text-left font-medium">Dominio</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((domain, index) => (
              <tr key={`${session.sessionId}-${domain}`} className="border-t border-gray-800 text-gray-200">
                <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                <td className="px-4 py-2 font-mono break-all">{domain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
