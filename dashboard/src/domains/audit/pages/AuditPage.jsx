import { useParams } from 'react-router-dom';
import AuditStudentList from '@audit/components/AuditStudentList';
import AuditTotals from '@audit/components/AuditTotals';
import useAuditReport from '@audit/hooks/useAuditReport';
import { AlertBanner, LoadingState, PageHeader } from '@shared/ui';
import styles from './AuditPage.module.css';

export default function AuditPage() {
  const { id: sessionId } = useParams();
  const audit = useAuditReport(sessionId);

  if (audit.error) {
    return (
      <div className={styles.state}>
        <AlertBanner className={styles.error}>{audit.error}</AlertBanner>
      </div>
    );
  }

  if (!audit.data) {
    return (
      <div className={styles.state}>
        <LoadingState label="Cargando auditoria..." />
      </div>
    );
  }

  const { session, totals, students } = audit.data;

  return (
    <div className={styles.pageShell}>
      <PageHeader backTo="/dashboard" title="Auditoria" subtitle={session.name} />

      <main className={styles.content}>
        <AuditTotals totals={totals} />
        <AuditStudentList students={students} expanded={audit.expanded} onToggle={audit.toggleStudent} />
      </main>
    </div>
  );
}
