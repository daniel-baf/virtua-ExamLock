import { TAB_LABELS } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/MonitorTabs.module.css';

export default function MonitorTabs({ activeTab, studentsByTab, onChange }) {
  return (
    <div className={styles.tabs}>
      <div className={styles.inner}>
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`${styles.tab} ${activeTab === key ? styles.tabActive : ''}`}
          >
            {label}
            <span className={styles.count}>
              {studentsByTab[key].length}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
