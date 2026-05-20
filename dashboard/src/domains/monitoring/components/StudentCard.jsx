import AuthImage from '@shared/components/AuthImage';
import { hasStudentAttention, liveStatusLabel, STATUS_META } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/StudentCard.module.css';

export default function StudentCard({
  student,
  tab,
  isPinned,
  onTogglePinned,
  onKick,
  onReadmit,
  onScreenshot,
  onMessage,
  onHistory,
  onLive,
}) {
  const { uid, status = 'waiting', screenUrl, liveFrame, email, name } = student;
  const meta = STATUS_META[status] ?? STATUS_META.offline;
  const label = email ?? name ?? uid.slice(0, 8);
  const streamLabel = liveStatusLabel(student.streamStatus);
  const requiresAttention = hasStudentAttention(student);
  const statusDotClass = styles[meta.dotClass.replace('status-', '')] ?? styles.offline;

  return (
    <article className={`${styles.card} ${requiresAttention ? styles.attentionCard : ''} ${status === 'offline' ? styles.offlineCard : ''}`}>
      <div className={styles.preview}>
        <div className={styles.imageFrame}>
          <button type="button" onClick={onHistory} className={styles.previewButton} aria-label={`Abrir historial de ${label}`}>
          {liveFrame ? (
            <img
              src={liveFrame}
              alt={`pantalla de ${label}`}
              className={styles.imageContent}
            />
          ) : screenUrl ? (
            <AuthImage uid={uid} src={screenUrl} alt={`pantalla de ${label}`} className={styles.imageContent} />
          ) : <div className={styles.imageContent}>{streamLabel}</div>
          }
          </button>
          <div className={styles.status}>
            <span className={`${styles.statusDot} ${statusDotClass}`} />
            {meta.label}
          </div>
          <button
            type="button"
            className={`${styles.pinButton} ${styles.overlayPin} ${isPinned ? styles.activePin : ''}`}
            onClick={event => {
              event.stopPropagation();
              onTogglePinned(uid);
            }}
            aria-label={isPinned ? 'Quitar pin' : 'Fijar alumno'}
          >
            {isPinned ? '★' : '☆'}
          </button>
          <div className={styles.streamBadge}>{streamLabel}</div>
          {student.screenshotPending && <div className={styles.pending}>Solicitando captura...</div>}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.nameRow}>
          <p className={styles.name} title={label}>{label}</p>
          {requiresAttention && <span className={`${styles.chip} ${styles.warningChip}`}>!</span>}
          {student.attempts > 0 && <span className={`${styles.chip} ${styles.infoChip}`}>{student.attempts}↩</span>}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onHistory} className={styles.actionButton} title="Ver historial">Historial</button>
          {tab === 'admitted' && (
            <>
              <button type="button" onClick={onLive} className={`${styles.actionButton} ${styles.liveButton}`} title="Ver en vivo">Enfocar</button>
              <button type="button" onClick={onScreenshot} className={`${styles.actionButton} ${styles.infoButton}`} title="Capturar pantalla">Captura</button>
              <button type="button" onClick={onMessage} className={styles.actionButton} title="Enviar mensaje">Msg</button>
              <button type="button" onClick={onKick} className={`${styles.actionButton} ${styles.dangerButton}`} title="Expulsar alumno">✕</button>
            </>
          )}
          {tab === 'kicked' && (
            <button type="button" onClick={onReadmit} className={`${styles.actionButton} ${styles.infoButton}`} title="Readmitir alumno">Readmitir</button>
          )}
        </div>
      </div>
    </article>
  );
}
