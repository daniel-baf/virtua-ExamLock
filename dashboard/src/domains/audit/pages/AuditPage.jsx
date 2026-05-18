import { Link, useParams } from 'react-router-dom';
import AuditStudentList from '../components/AuditStudentList';
import AuditTotals from '../components/AuditTotals';
import useAuditReport from '../hooks/useAuditReport';
import '../Audit.css';

export default function AuditPage() {
  const { id: sessionId } = useParams();
  const audit = useAuditReport(sessionId);

  if (audit.error) {
    return (
      <div className="audit-state">
        <p className="audit-state__error">{audit.error}</p>
      </div>
    );
  }

  if (!audit.data) {
    return (
      <div className="audit-state">
        <div className="audit-spinner" />
      </div>
    );
  }

  const { session, totals, students } = audit.data;

  return (
    <div className="audit-shell">
      <header className="audit-header">
        <div className="audit-header__inner">
          <Link to="/dashboard" className="audit-header__back">Volver</Link>
          <span className="audit-header__title">Auditoría — {session.name}</span>
        </div>
      </header>

      <main className="audit-content">
        <AuditTotals totals={totals} />
        <AuditStudentList students={students} expanded={audit.expanded} onToggle={audit.toggleStudent} />
      </main>
    </div>
  );
}
