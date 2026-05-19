import AuthImage from '@shared/components/AuthImage';
import { closeReasonLabel, fmtTime, hasStudentAttention, liveStatusLabel, STATUS_META } from '@monitoring/monitoringModel';
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
  const closeLabel = closeReasonLabel(student.closeReason);
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
        <div className={styles.copy}>
          <div className={styles.headline}>
            <p className={styles.name} title={label}>{label}</p>
            {requiresAttention && <span className={`${styles.chip} ${styles.warningChip}`}>Requiere revision</span>}
          </div>
          {requiresAttention && (
            <div className={styles.attentionBanner}>
              <strong>Accion requerida</strong>
              <span>{status === 'offline' ? 'Alumno offline' : 'Se detecto una incidencia en esta estacion.'}</span>
            </div>
          )}
          <p className={styles.meta}>Ultima captura: {fmtTime(student.lastScreenshotAt)}</p>
          <p className={styles.meta}>Ultimo frame: {fmtTime(student.liveTakenAt)}</p>
          {student.lastHeartbeat && <p className={styles.meta}>Ultimo heartbeat: {fmtTime(student.lastHeartbeat)}</p>}
          {status === 'offline' && student.offlineAt && <p className={styles.warningText}>Offline desde {fmtTime(student.offlineAt)}</p>}
          {student.attempts > 0 && <p className={styles.warningText}>{student.attempts} reingreso(s)</p>}
          {status === 'closed' && closeLabel && <p className={styles.meta}>{closeLabel}</p>}
          {student.screenshotError && <p className={styles.errorText} title={student.screenshotError}>Error de captura</p>}
          {student.streamError && <p className={styles.errorText} title={student.streamError}>{student.streamError}</p>}
          {student.streamReady && <p className={styles.meta}>Stream preparado</p>}
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={onHistory} className={styles.actionButton}>Historial</button>
          {tab === 'admitted' && (
            <>
              <button type="button" onClick={onLive} className={`${styles.actionButton} ${styles.liveButton}`}>Enfocar</button>
              <button type="button" onClick={onScreenshot} className={`${styles.actionButton} ${styles.infoButton}`}>Capturar</button>
              <button type="button" onClick={onMessage} className={styles.actionButton}>Mensaje</button>
              <button type="button" onClick={onKick} className={`${styles.actionButton} ${styles.dangerButton}`}>Expulsar</button>
            </>
          )}
          {tab === 'kicked' && (
            <button type="button" onClick={onReadmit} className={`${styles.actionButton} ${styles.infoButton} ${styles.wideButton}`}>Readmitir</button>
          )}
        </div>
      </div>
    </article>
  );
}
