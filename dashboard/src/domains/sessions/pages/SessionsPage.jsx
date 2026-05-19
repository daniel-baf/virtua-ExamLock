import SessionCard from '@sessions/components/SessionCard';
import useSessions from '@sessions/hooks/useSessions';
import { AlertBanner, Button, EmptyState, LoadingState, PageHeader, PageSection } from '@shared/ui';
import styles from './SessionsPage.module.css';

export default function SessionsPage() {
  const sessions = useSessions();

  return (
    <div className={styles.pageShell}>
      <PageHeader
        brandTitle="ExamLock"
        brandSubtitle="Sesiones docentes"
        actions={(
          <>
            <span className={styles.topbarEmail}>{sessions.teacherEmail}</span>
            <Button onClick={sessions.refresh} disabled={sessions.loading} variant="ghost">
              {sessions.loading ? 'Cargando...' : 'Actualizar'}
            </Button>
            <Button onClick={sessions.resetData} disabled={sessions.resetting} variant="danger">
              {sessions.resetting ? 'Borrando...' : 'Reset DB'}
            </Button>
            <Button onClick={sessions.signOut} variant="link">
              Cerrar sesion
            </Button>
          </>
        )}
      />

      <main className={styles.content}>
        <PageSection
          title="Sesiones"
          actions={(
            <Button to="/session/new" variant="primary">
              <span>+</span> Nueva sesion
            </Button>
          )}
        />

        {sessions.error && <AlertBanner>{sessions.error}</AlertBanner>}

        {sessions.loading ? (
          <LoadingState label="Cargando sesiones..." />
        ) : sessions.sessions.length === 0 ? (
          <EmptyState title="Sin sesiones aun." description="Crea una para comenzar." />
        ) : (
          <div className={styles.stack}>
            {sessions.sessions.map(session => <SessionCard key={session.sessionId} session={session} />)}
          </div>
        )}
      </main>
    </div>
  );
}
