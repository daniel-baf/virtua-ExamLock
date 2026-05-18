import { closeReasonLabel, fmtTime, statusSummaryLabel } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/ClosedStudentRow.module.css';

export default function ClosedStudentRow({ student, onHistory, onReadmit, onTogglePinned, isPinned, isHighlighted }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const statusLabel = statusSummaryLabel(student);

  return (
    <article className={`${styles.row} ${isHighlighted ? styles.highlight : ''}`}>
      <div className={styles.main}>
        <button type="button" className={`${styles.pinButton} ${isPinned ? styles.pinActive : ''}`} onClick={() => onTogglePinned(student.uid)}>
          {isPinned ? '★' : '☆'}
        </button>
        <div className={styles.identity}>
          <p className={styles.name}>{label}</p>
          <p className={styles.meta}>{statusLabel}</p>
        </div>
      </div>

      <div className={styles.details}>
        <span>{closeReasonLabel(student.closeReason) || 'Cierre sin detalle'}</span>
        <span>Último heartbeat: {fmtTime(student.lastHeartbeat)}</span>
        <span>Captura: {fmtTime(student.lastScreenshotAt)}</span>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onHistory} className={styles.actionButton}>
          Historial
        </button>
        {student.status === 'kicked' && (
          <button type="button" onClick={onReadmit} className={`${styles.actionButton} ${styles.infoButton}`}>
            Readmitir
          </button>
        )}
      </div>
    </article>
  );
}
