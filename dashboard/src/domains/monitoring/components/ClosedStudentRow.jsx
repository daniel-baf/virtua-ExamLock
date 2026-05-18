import { closeReasonLabel, fmtTime, statusSummaryLabel } from '../monitoringModel';

export default function ClosedStudentRow({ student, onHistory, onReadmit, onTogglePinned, isPinned, isHighlighted }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const statusLabel = statusSummaryLabel(student);

  return (
    <article className={`closed-row ${isHighlighted ? 'closed-row--highlight' : ''}`}>
      <div className="closed-row__main">
        <button type="button" className={`pin-btn ${isPinned ? 'pin-btn--active' : ''}`} onClick={() => onTogglePinned(student.uid)}>
          {isPinned ? '★' : '☆'}
        </button>
        <div className="closed-row__identity">
          <p className="closed-row__name">{label}</p>
          <p className="closed-row__meta">{statusLabel}</p>
        </div>
      </div>

      <div className="closed-row__details">
        <span>{closeReasonLabel(student.closeReason) || 'Cierre sin detalle'}</span>
        <span>Último heartbeat: {fmtTime(student.lastHeartbeat)}</span>
        <span>Captura: {fmtTime(student.lastScreenshotAt)}</span>
      </div>

      <div className="closed-row__actions">
        <button type="button" onClick={onHistory} className="student-action">
          Historial
        </button>
        {student.status === 'kicked' && (
          <button type="button" onClick={onReadmit} className="student-action student-action--info">
            Readmitir
          </button>
        )}
      </div>
    </article>
  );
}
