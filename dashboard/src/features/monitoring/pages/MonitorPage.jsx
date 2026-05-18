import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import HistoryPanel from '../components/HistoryPanel';
import LiveStreamDialog from '../components/LiveStreamDialog';
import MessageDialog from '../components/MessageDialog';
import ClosedStudentRow from '../components/ClosedStudentRow';
import MonitorHeader from '../components/MonitorHeader';
import MonitorToolbar from '../components/MonitorToolbar';
import MonitorTabs from '../components/MonitorTabs';
import NetworkPanel from '../components/NetworkPanel';
import StudentCard from '../components/StudentCard';
import useMonitorPreferences from '../hooks/useMonitorPreferences';
import useMonitorSession from '../hooks/useMonitorSession';
import { hasStudentAttention, matchesStudentFilter, matchesStudentSearch } from '../monitoringModel';
import '../Monitoring.css';

export default function MonitorPage() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const monitor = useMonitorSession(sessionId);
  const preferences = useMonitorPreferences({
    sessionId,
    userKey: user?.uid ?? user?.email,
  });

  const baseStudents = monitor.studentsByTab[preferences.tab] ?? [];
  const visibleStudents = [...baseStudents]
    .filter(student => matchesStudentSearch(student, preferences.search))
    .filter(student => matchesStudentFilter(student, preferences.filter))
    .filter(student => (preferences.showPinnedOnly ? preferences.pinnedIds.has(student.uid) : true))
    .sort((left, right) => compareStudents(left, right, preferences.pinnedIds));

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
          defaultLoading={monitor.defaultLoading}
          activeCount={monitor.activeWhitelistCount}
          onDomainsChange={monitor.setWhitelistDomains}
          onToggleBlockInternet={() => monitor.setBlockInternet(value => !value)}
          onLoadDefault={monitor.loadDefaultDomains}
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

      <MonitorTabs activeTab={preferences.tab} studentsByTab={monitor.studentsByTab} onChange={preferences.setTab} />

      <MonitorToolbar
        search={preferences.search}
        onSearchChange={preferences.setSearch}
        filter={preferences.filter}
        onFilterChange={preferences.setFilter}
        columns={preferences.columns}
        onColumnsChange={preferences.setColumns}
        closedView={preferences.closedView}
        onClosedViewChange={preferences.setClosedView}
        showPinnedOnly={preferences.showPinnedOnly}
        onTogglePinnedOnly={() => preferences.setShowPinnedOnly(value => !value)}
        activeTab={preferences.tab}
        visibleCount={visibleStudents.length}
      />

      <main className="monitor-main">
        {visibleStudents.length === 0 ? (
          <div className="monitor-empty">No hay alumnos para los filtros actuales.</div>
        ) : preferences.tab === 'kicked' && preferences.closedView === 'list' ? (
          <div className="closed-list">
            {visibleStudents.map(student => (
              <ClosedStudentRow
                key={student.uid}
                student={student}
                isPinned={preferences.pinnedIds.has(student.uid)}
                isHighlighted={hasStudentAttention(student)}
                onTogglePinned={preferences.togglePinned}
                onHistory={() => monitor.openHistory(student)}
                onReadmit={() => monitor.readmit(student.uid)}
              />
            ))}
          </div>
        ) : (
          <div className="monitor-grid" style={{ '--monitor-columns': preferences.columns }}>
            {visibleStudents.map(student => (
              <StudentCard
                key={student.uid}
                student={student}
                tab={preferences.tab}
                isPinned={preferences.pinnedIds.has(student.uid)}
                onTogglePinned={preferences.togglePinned}
                onHistory={() => monitor.openHistory(student)}
                onLive={() => monitor.openLive(student)}
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

      {monitor.liveTarget && (
        <LiveStreamDialog
          student={monitor.liveTarget}
          onClose={monitor.closeLive}
          onCapture={() => monitor.capture(monitor.liveTarget.uid)}
        />
      )}
    </div>
  );
}

function compareStudents(left, right, pinnedIds) {
  const leftPinned = pinnedIds.has(left.uid);
  const rightPinned = pinnedIds.has(right.uid);
  if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;

  const leftAttention = hasStudentAttention(left);
  const rightAttention = hasStudentAttention(right);
  if (leftAttention !== rightAttention) return leftAttention ? -1 : 1;

  const rightTimestamp = Math.max(right.lastHeartbeat ?? 0, right.lastScreenshotAt ?? 0, right.liveTakenAt ?? 0);
  const leftTimestamp = Math.max(left.lastHeartbeat ?? 0, left.lastScreenshotAt ?? 0, left.liveTakenAt ?? 0);
  return rightTimestamp - leftTimestamp;
}
