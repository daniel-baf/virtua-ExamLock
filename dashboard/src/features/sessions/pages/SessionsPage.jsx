import { Link } from 'react-router-dom';
import SessionCard from '@/features/sessions/components/SessionCard';
import useSessions from '../hooks/useSessions';
import '../Sessions.css';

export default function SessionsPage() {
  const sessions = useSessions();

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar__inner">
        <div className="topbar__title">
          <div className="brand-mark" />
          <div>
            <p className="brand-title">ExamLock</p>
            <p className="brand-subtitle">Sesiones docentes</p>
          </div>
        </div>
        <div className="topbar__actions">
          <span className="topbar__email">{sessions.teacherEmail}</span>
          <button onClick={sessions.refresh} disabled={sessions.loading} className="btn btn-ghost">
            {sessions.loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button onClick={sessions.resetData} disabled={sessions.resetting} className="btn btn-danger">
            {sessions.resetting ? 'Borrando...' : 'Reset DB'}
          </button>
          <button onClick={sessions.signOut} className="btn btn-link">
            Cerrar sesion
          </button>
        </div>
        </div>
      </header>

      <main className="content">
        <div className="section-title">
          <h2 className="text-xl font-semibold">Sesiones</h2>
          <Link to="/session/new" className="link-primary">
            <span>+</span> Nueva sesión
          </Link>
        </div>

        {sessions.error && <div className="alert-error">{sessions.error}</div>}

        {sessions.loading ? (
          <div className="loading-state">
            <p>Cargando sesiones…</p>
          </div>
        ) : sessions.sessions.length === 0 ? (
          <div className="empty-state">
            <p className="text-lg">Sin sesiones aún.</p>
            <p className="mt-1 text-sm">Crea una para comenzar.</p>
          </div>
        ) : (
          <div className="stack">
            {sessions.sessions.map(session => <SessionCard key={session.sessionId} session={session} />)}
          </div>
        )}
      </main>
    </div>
  );
}
