import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@auth';
import {
  AttentionAlerts,
  ClosedStudentRow,
  hasStudentAttention,
  HistoryPanel,
  LiveStreamDialog,
  matchesStudentFilter,
  matchesStudentSearch,
  MessageDialog,
  MonitorHeader,
  MonitorTabs,
  MonitorToolbar,
  NetworkPanel,
  StudentCard,
  useMonitorPreferences,
  useMonitorSession,
} from '@monitoring';
import styles from '@monitoring/pages/MonitorPage.module.css';

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
    <div className={styles.shell}>
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

      {monitor.sessionError && <div className={styles.alert}>{monitor.sessionError}</div>}

      <AttentionAlerts
        alerts={monitor.alerts}
        onAcknowledge={monitor.acknowledgeAlert}
        onFocusStudent={uid => {
          preferences.setTab('admitted');
          preferences.setFilter('attention');
          preferences.setSearch('');
          const student = monitor.studentsByTab.admitted?.find(item => item.uid === uid)
            ?? monitor.studentsByTab.kicked?.find(item => item.uid === uid);
          if (student) {
            monitor.openHistory(student);
          }
        }}
      />

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
        <div className={styles.endedBanner}>
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

      <main className={styles.main}>
        {visibleStudents.length === 0 ? (
          <div className={styles.empty}>No hay alumnos para los filtros actuales.</div>
        ) : preferences.tab === 'kicked' && preferences.closedView === 'list' ? (
          <div className={styles.closedList}>
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
          <div className={styles.grid} style={{ '--monitor-columns': preferences.columns }}>
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
