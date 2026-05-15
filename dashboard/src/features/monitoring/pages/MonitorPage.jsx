import { useNavigate, useParams } from 'react-router-dom';
import HistoryPanel from '../components/HistoryPanel';
import MessageDialog from '../components/MessageDialog';
import MonitorHeader from '../components/MonitorHeader';
import MonitorTabs from '../components/MonitorTabs';
import NetworkPanel from '../components/NetworkPanel';
import StudentCard from '../components/StudentCard';
import useMonitorSession from '../hooks/useMonitorSession';
import '../Monitoring.css';

export default function MonitorPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const monitor = useMonitorSession(sessionId);
  const visibleStudents = monitor.studentsByTab[monitor.tab];

  return (
    <div className="monitor-shell">
      <MonitorHeader
        session={monitor.session}
        sessionLoading={monitor.sessionLoading}
        connected={monitor.connected}
        totals={monitor.totals}
        captureAllBusy={monitor.captureAllBusy}
        captureAllNote={monitor.captureAllNote}
        examEnded={monitor.examEnded}
        onCaptureAll={monitor.captureAll}
        onToggleNetwork={() => monitor.setShowWhitelist(value => !value)}
        onEndExam={monitor.endExam}
      />

      {monitor.sessionError && <div className="monitor-alert">{monitor.sessionError}</div>}

      {monitor.showWhitelist && (
        <NetworkPanel
          domains={monitor.whitelistDomains}
          blockInternet={monitor.blockInternet}
          saving={monitor.whitelistSaving}
          onDomainsChange={monitor.setWhitelistDomains}
          onToggleBlockInternet={() => monitor.setBlockInternet(value => !value)}
          onApply={monitor.applyWhitelist}
        />
      )}

      {monitor.examEnded && (
        <div className="exam-ended-banner">
          Examen terminado.{' '}
          <button onClick={() => navigate(`/session/${sessionId}/audit`)}>
            Ver auditoria
          </button>
        </div>
      )}

      <MonitorTabs activeTab={monitor.tab} studentsByTab={monitor.studentsByTab} onChange={monitor.setTab} />

      <main className="monitor-main">
        {visibleStudents.length === 0 ? (
          <div className="monitor-empty">Sin alumnos en esta categoria.</div>
        ) : (
          <div className="monitor-grid">
            {visibleStudents.map(student => (
              <StudentCard
                key={student.uid}
                student={student}
                tab={monitor.tab}
                onHistory={() => monitor.openHistory(student)}
                onKick={() => monitor.kick(student.uid)}
                onReadmit={() => monitor.readmit(student.uid)}
                onScreenshot={() => monitor.capture(student.uid)}
                onMessage={() => monitor.setMessageTarget(student.uid)}
              />
            ))}
          </div>
        )}
      </main>

      {monitor.messageTarget && (
        <MessageDialog
          text={monitor.messageText}
          onTextChange={monitor.setMessageText}
          onCancel={() => {
            monitor.setMessageTarget(null);
            monitor.setMessageText('');
          }}
          onSend={monitor.sendMessage}
        />
      )}

      {monitor.historyTarget && (
        <HistoryPanel
          student={monitor.historyTarget}
          screenshots={monitor.historyShots}
          loading={monitor.historyLoading}
          error={monitor.historyError}
          onClose={monitor.closeHistory}
          onCapture={() => monitor.capture(monitor.historyTarget.uid)}
        />
      )}
    </div>
  );
}
