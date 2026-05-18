import AuthImage from '@/shared/components/AuthImage';
import { closeReasonLabel, fmtTime, hasStudentAttention, liveStatusLabel, STATUS_META } from '../monitoringModel';

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

  return (
    <article className={`student-card ${requiresAttention ? 'student-card--attention' : ''}`}>
      <div className="student-card__preview">
        <div className="student-card__image">
          <button type="button" onClick={onHistory} className="student-card__preview-button" aria-label={`Abrir historial de ${label}`}>
          {liveFrame ? (
            <img
              src={liveFrame}
              alt={`pantalla de ${label}`}
              className="protected-image"
            />
          ) : screenUrl ? (
            <AuthImage uid={uid} src={screenUrl} alt={`pantalla de ${label}`} className="protected-image" />
          ) : <div className="student-card__placeholder">{streamLabel}</div>
          }
          </button>
          <div className="student-card__status">
            <span className={`status-dot ${meta.dotClass}`} />
            {meta.label}
          </div>
          <button
            type="button"
            className={`pin-btn pin-btn--overlay ${isPinned ? 'pin-btn--active' : ''}`}
            onClick={event => {
              event.stopPropagation();
              onTogglePinned(uid);
            }}
            aria-label={isPinned ? 'Quitar pin' : 'Fijar alumno'}
          >
            {isPinned ? '★' : '☆'}
          </button>
          <div className="student-card__stream-badge">{streamLabel}</div>
          {student.screenshotPending && <div className="student-card__pending">Solicitando captura...</div>}
        </div>
      </div>

      <div className="student-card__body">
        <div className="student-card__copy">
          <div className="student-card__headline">
            <p className="student-card__name" title={label}>{label}</p>
            {requiresAttention && <span className="student-chip student-chip--warning">Atención</span>}
          </div>
          <p className="student-card__meta">Ultima captura: {fmtTime(student.lastScreenshotAt)}</p>
          <p className="student-card__meta">Ultimo frame: {fmtTime(student.liveTakenAt)}</p>
          {student.lastHeartbeat && <p className="student-card__meta">Ultimo heartbeat: {fmtTime(student.lastHeartbeat)}</p>}
          {status === 'offline' && student.offlineAt && <p className="student-card__warning">Offline desde {fmtTime(student.offlineAt)}</p>}
          {student.attempts > 0 && <p className="student-card__warning">{student.attempts} reingreso(s)</p>}
          {status === 'closed' && closeLabel && <p className="student-card__meta">{closeLabel}</p>}
          {student.screenshotError && <p className="student-card__error" title={student.screenshotError}>Error de captura</p>}
          {student.streamError && <p className="student-card__error" title={student.streamError}>{student.streamError}</p>}
          {student.streamReady && <p className="student-card__meta">Stream preparado</p>}
        </div>

        <div className="student-actions">
          <button type="button" onClick={onHistory} className="student-action">Historial</button>
          {tab === 'admitted' && (
            <>
              <button type="button" onClick={onLive} className="student-action student-action--live">Enfocar</button>
              <button type="button" onClick={onScreenshot} className="student-action student-action--info">Capturar</button>
              <button type="button" onClick={onMessage} className="student-action">Mensaje</button>
              <button type="button" onClick={onKick} className="student-action student-action--danger">Expulsar</button>
            </>
          )}
          {tab === 'kicked' && (
            <button type="button" onClick={onReadmit} className="student-action student-action--info student-action--wide">Readmitir</button>
          )}
        </div>
      </div>
    </article>
  );
}
