import AuthImage from '@shared/components/AuthImage';
import { fmtTime } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/HistoryPanel.module.css';

export default function HistoryPanel({ student, screenshots, loading, error, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);

  return (
    <div className={styles.drawer}>
      <aside className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <div>
              <p className={styles.title}>{label}</p>
              <p className={styles.subtitle}>{screenshots.length} capturas registradas</p>
            </div>
            <div className={styles.actions}>
              <button onClick={onCapture} className={`${styles.actionButton} ${styles.infoButton}`}>Capturar ahora</button>
              <button onClick={onClose} className={styles.actionButton}>Cerrar</button>
            </div>
          </div>
        </div>

        <div className={styles.body}>
          {loading && <div className={styles.state}>Cargando historial...</div>}
          {error && <div className={styles.error}>{error}</div>}
          {!loading && !error && screenshots.length === 0 && (
            <div className={`${styles.state} ${styles.boxedState}`}>Sin capturas para este alumno.</div>
          )}
          {!loading && !error && screenshots.length > 0 && (
            <div className={styles.grid}>
              {screenshots.map((shot, index) => (
                <div key={shot.id ?? `${shot.url}-${index}`} className={styles.shot}>
                  <AuthImage uid={student.uid} src={shot.url} alt={`captura ${index + 1}`} className={styles.image} />
                  <div className={styles.meta}>
                    <span>{fmtTime(shot.takenAt)}</span>
                    <span>Vista protegida</span>
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
