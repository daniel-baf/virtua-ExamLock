import AuthImage from '@/shared/components/AuthImage';
import { EVENT_LABEL, fmtAuditTime, formatAuditEventDetail } from '../auditModel';

export default function AuditStudentList({ students, expanded, onToggle }) {
  return (
    <div className="audit-students">
      {students.map(student => (
        <AuditStudent key={student.uid} student={student} expanded={expanded[student.uid]} onToggle={() => onToggle(student.uid)} />
      ))}
    </div>
  );
}

function AuditStudent({ student, expanded, onToggle }) {
  const readmitCount = student.attempts ?? 0;

  return (
    <article className="audit-student">
      <button className="audit-student__button" onClick={onToggle}>
        <span className={`audit-student__dot ${dotClass(student.status)}`} />
        <span className="audit-student__email">{student.email ?? student.uid}</span>
        {readmitCount > 0 && <span className="audit-pill">{readmitCount} reingreso{readmitCount > 1 ? 's' : ''}</span>}
        <span className="audit-student__count">{student.screenshots?.length ?? 0} capturas</span>
        <span className="audit-student__chevron">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="audit-student__details">
          <Timeline events={student.timeline ?? []} />
          <ScreenshotGallery student={student} />
        </div>
      )}
    </article>
  );
}

function Timeline({ events }) {
  if (events.length === 0) return null;

  return (
    <section>
      <h4 className="audit-section-title">Timeline</h4>
      <div className="audit-timeline">
        {events.map((event, index) => (
          <div key={index} className="audit-event">
            <span className="audit-event__time">{fmtAuditTime(event.ts)}</span>
            <div className="audit-event__content">
              <span className="audit-event__label">{EVENT_LABEL[event.type] ?? event.type}</span>
              {formatAuditEventDetail(event) && (
                <span className="audit-event__reason">{formatAuditEventDetail(event)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScreenshotGallery({ student }) {
  if (!student.screenshots?.length) return null;

  return (
    <section>
      <h4 className="audit-section-title">Capturas ({student.screenshots.length})</h4>
      <div className="audit-gallery">
        {student.screenshots.map((shot, index) => (
          <AuthImage
            key={index}
            uid={student.uid}
            src={shot.url}
            alt={`captura ${index + 1}`}
            className="audit-gallery__image"
          />
        ))}
      </div>
    </section>
  );
}

function dotClass(status) {
  if (status === 'admitted') return 'audit-student__dot--ok';
  if (status === 'kicked') return 'audit-student__dot--danger';
  return 'audit-student__dot--neutral';
}
