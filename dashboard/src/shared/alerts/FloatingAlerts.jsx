import { useState } from 'react';
import { useAlerts } from './AlertsContext';
import styles from './FloatingAlerts.module.css';

export default function FloatingAlerts() {
  const { alerts, activeSessionId, acknowledgeAlert, acknowledgeGroup, clearAll, focusStudent } = useAlerts();
  const [panelOpen, setPanelOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  if (alerts.length === 0) return null;

  const groups = groupByStudent(alerts);
  const dangerCount = alerts.filter(a => a.level === 'danger').length;
  const warningCount = alerts.filter(a => a.level === 'warning').length;

  function toggleGroup(uid) {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  }

  if (!panelOpen) {
    return (
      <div className={styles.root}>
        <button className={styles.pill} onClick={() => setPanelOpen(true)} aria-label="Ver alertas">
          {dangerCount > 0 && (
            <span className={`${styles.pillBadge} ${styles.danger}`}>
              <span className={`${styles.pillDot} ${styles.danger}`} />
              {dangerCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className={`${styles.pillBadge} ${styles.warning}`}>
              <span className={`${styles.pillDot} ${styles.warning}`} />
              {warningCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>
            <span className={styles.warningDot} />
            {alerts.length} alerta{alerts.length !== 1 ? 's' : ''}
          </span>
          <div className={styles.panelHeaderActions}>
            <button className={`${styles.iconButton} ${styles.danger}`} onClick={clearAll} title="Descartar todas">
              Limpiar
            </button>
            <button className={styles.iconButton} onClick={() => setPanelOpen(false)} title="Minimizar">
              ✕
            </button>
          </div>
        </div>

        <div className={styles.groupList}>
          {groups.map(group => {
            const isOpen = expandedGroups.has(group.uid);
            const topLevel = group.alerts.some(a => a.level === 'danger') ? 'danger' : 'warning';

            return (
              <div key={group.uid} className={styles.group}>
                <button className={styles.groupHeader} onClick={() => toggleGroup(group.uid)}>
                  <span className={`${styles.groupLevel} ${styles[topLevel]}`} />
                  <span className={styles.groupStudent} title={group.label}>{group.label}</span>
                  {group.alerts.length > 1 && (
                    <span className={styles.groupCount}>{group.alerts.length}</span>
                  )}
                  <button
                    className={styles.groupAckBtn}
                    onClick={e => { e.stopPropagation(); acknowledgeGroup(group.uid); }}
                    title="Descartar grupo"
                  >
                    ✕
                  </button>
                  <span className={`${styles.chevron} ${isOpen ? styles.open : ''}`}>▼</span>
                </button>

                {isOpen && (
                  <div className={styles.alertList}>
                    {group.alerts.map(alert => (
                      <div key={alert.id} className={`${styles.alertItem} ${styles[alert.level]}`}>
                        <p className={styles.alertMessage}>{alert.message}</p>
                        {alert.meta && <p className={styles.alertMeta}>{alert.meta}</p>}
                        <div className={styles.alertActions}>
                          {alert.studentUid && activeSessionId && (
                            <button
                              className={`${styles.alertBtn} ${styles.alertBtnGhost}`}
                              onClick={() => focusStudent(alert.studentUid)}
                            >
                              Ver alumno
                            </button>
                          )}
                          <button
                            className={`${styles.alertBtn} ${styles.alertBtnAck}`}
                            onClick={() => acknowledgeAlert(alert.id)}
                          >
                            Marcar revisada
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function groupByStudent(alerts) {
  const map = new Map();
  for (const alert of alerts) {
    const uid = alert.studentUid ?? '__unknown';
    if (!map.has(uid)) {
      map.set(uid, { uid, label: alert.studentLabel ?? uid, alerts: [] });
    }
    map.get(uid).alerts.push(alert);
  }
  return [...map.values()];
}
