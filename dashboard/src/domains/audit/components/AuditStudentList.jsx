import AuthImage from '@shared/components/AuthImage';
import CardPanel from '@shared/ui/CardPanel';
import { EVENT_LABEL, fmtAuditTime, formatAuditEventDetail } from '@audit/auditModel';
import styles from './AuditStudentList.module.css';

export default function AuditStudentList({ students, expanded, onToggle }) {
  return (
    <div className={styles.students}>
      {students.map(student => (
        <AuditStudent key={student.uid} student={student} expanded={expanded[student.uid]} onToggle={() => onToggle(student.uid)} />
      ))}
    </div>
  );
}

function AuditStudent({ student, expanded, onToggle }) {
  const readmitCount = student.attempts ?? 0;

  return (
    <CardPanel as="article" className={styles.student}>
      <button className={styles.button} onClick={onToggle}>
        <span className={`${styles.dot} ${dotClass(student.status)}`} />
        <span className={styles.email}>{student.email ?? student.uid}</span>
        {readmitCount > 0 && <span className={styles.pill}>{readmitCount} reingreso{readmitCount > 1 ? 's' : ''}</span>}
        <span className={styles.count}>{student.screenshots?.length ?? 0} capturas</span>
        <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className={styles.details}>
          <Timeline events={student.timeline ?? []} />
          <ScreenshotGallery student={student} />
        </div>
      )}
    </CardPanel>
  );
}

function Timeline({ events }) {
  if (events.length === 0) return null;

  return (
    <section>
      <h4 className={styles.sectionTitle}>Timeline</h4>
      <div className={styles.timeline}>
        {events.map((event, index) => (
          <div key={index} className={styles.event}>
            <span className={styles.eventTime}>{fmtAuditTime(event.ts)}</span>
            <div className={styles.eventContent}>
              <span className={styles.eventLabel}>{EVENT_LABEL[event.type] ?? event.type}</span>
              {formatAuditEventDetail(event) && (
                <span className={styles.eventReason}>{formatAuditEventDetail(event)}</span>
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
      <h4 className={styles.sectionTitle}>Capturas ({student.screenshots.length})</h4>
      <div className={styles.gallery}>
        {student.screenshots.map((shot, index) => (
          <AuthImage
            key={index}
            uid={student.uid}
            src={shot.url}
            alt={`captura ${index + 1}`}
            className={styles.galleryImage}
          />
        ))}
      </div>
    </section>
  );
}

function dotClass(status) {
  if (status === 'admitted') return styles.dotOk;
  if (status === 'kicked') return styles.dotDanger;
  return styles.dotNeutral;
}
