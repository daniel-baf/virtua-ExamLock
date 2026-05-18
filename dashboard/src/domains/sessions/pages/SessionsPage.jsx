import { Link } from 'react-router-dom';
import SessionCard from '../components/SessionCard';
import useSessions from '../hooks/useSessions';
import '../Sessions.css';
import styles from './SessionsPage.module.css';

export default function SessionsPage() {
  const sessions = useSessions();

  return (
    <div className={styles.pageShell}>
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
        <div className={styles.topbarTitle}>
          <div className="brand-mark" />
          <div>
            <p className="brand-title">ExamLock</p>
            <p className="brand-subtitle">Sesiones docentes</p>
          </div>
        </div>
        <div className={styles.topbarActions}>
          <span className={styles.topbarEmail}>{sessions.teacherEmail}</span>
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

      <main className={styles.content}>
        <div className={styles.sectionTitle}>
          <h2 className="text-xl font-semibold">Sesiones</h2>
          <Link to="/session/new" className="link-primary">
            <span>+</span> Nueva sesión
          </Link>
        </div>

        {sessions.error && <div className={styles.alertError}>{sessions.error}</div>}

        {sessions.loading ? (
          <div className={styles.loadingState}>
            <p>Cargando sesiones…</p>
          </div>
        ) : sessions.sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <p className="text-lg">Sin sesiones aún.</p>
            <p className="mt-1 text-sm">Crea una para comenzar.</p>
          </div>
        ) : (
          <div className={styles.stack}>
            {sessions.sessions.map(session => <SessionCard key={session.sessionId} session={session} />)}
          </div>
        )}
      </main>
    </div>
  );
}
