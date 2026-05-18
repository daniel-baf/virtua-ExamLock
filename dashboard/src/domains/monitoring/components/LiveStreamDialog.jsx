import AuthImage from '@shared/components/AuthImage';
import { liveStatusLabel } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/LiveStreamDialog.module.css';

export default function LiveStreamDialog({ student, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const statusText = liveStatusLabel(student.streamStatus);

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>{label}</h3>
            <p className={styles.subtitle}>{statusText}{student.liveTakenAt ? ` · ${new Date(student.liveTakenAt).toLocaleTimeString()}` : ''}</p>
          </div>
          <div className={styles.actions}>
            <button onClick={onCapture} className={`${styles.actionButton} ${styles.infoButton}`}>Capturar</button>
            <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
          </div>
        </header>

        <div className={styles.view}>
          {student.liveFrame ? (
            <img src={student.liveFrame} alt={`Pantalla en vivo de ${label}`} className={styles.image} />
          ) : student.screenUrl ? (
            <AuthImage uid={student.uid} src={student.screenUrl} alt={`Pantalla en vivo de ${label}`} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>{student.streamError || statusText}</div>
          )}
          {student.streamError && <div className={styles.error}>{student.streamError}</div>}
        </div>
      </section>
    </div>
  );
}
