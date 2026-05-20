import { Link } from 'react-router-dom';
import { formatStreamConfig } from '@sessions';
import Metric from '@monitoring/components/Metric';
import styles from '@monitoring/components/MonitorHeader.module.css';

export default function MonitorHeader({
  session,
  sessionLoading,
  connected,
  totals,
  remainingLabel,
  captureAllBusy,
  captureAllNote,
  examEnded,
  onCaptureAll,
  onToggleNetwork,
  onEndExam,
}) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.title}>
          <Link to="/dashboard" className={styles.back}>Volver</Link>
          <div className={`${styles.connection} ${connected ? styles.online : styles.offline}`} />
          <div className={styles.copy}>
            <h1 className={styles.heading}>{session?.name ?? 'Monitor de examen'}</h1>
            <p className={styles.subheading}>
              {connected ? 'Canal docente conectado' : 'Canal docente desconectado'}
              {session?.streamConfig ? ` · Stream ${formatStreamConfig(session.streamConfig)}` : ''}
            </p>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.sessionCode} aria-label={`Codigo de sesion ${session?.code ?? ''}`}>
            <span className={styles.sessionCodeLabel}>Codigo</span>
            <code className={styles.sessionCodeValue}>
              {sessionLoading ? 'Cargando' : session?.code ?? 'No disponible'}
            </code>
          </div>
          <Metric label="Total" value={totals.all} />
          <Metric label="Activos" value={totals.active} tone="emerald" />
          <Metric label="Alertas" value={totals.alerts} tone="amber" />
          <Metric label="Restante" value={remainingLabel ?? '--:--'} />
          <button
            onClick={onCaptureAll}
            disabled={captureAllBusy || totals.active === 0}
            className={`${styles.actionButton} ${styles.infoButton}`}
          >
            {captureAllBusy ? 'Solicitando...' : 'Capturar todos'}
          </button>
          <button onClick={onToggleNetwork} className={`${styles.actionButton} ${styles.neutralButton}`}>
            Red
          </button>
          <button
            onClick={onEndExam}
            disabled={examEnded}
            className={`${styles.actionButton} ${styles.dangerButton}`}
          >
            {examEnded ? 'Terminado' : 'Terminar'}
          </button>
        </div>
      </div>
      {captureAllNote && <p className={styles.note}>{captureAllNote}</p>}
    </header>
  );
}
