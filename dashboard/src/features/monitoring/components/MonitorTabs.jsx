import { TAB_LABELS } from '../monitoringModel';

export default function MonitorTabs({ activeTab, studentsByTab, onChange }) {
  return (
    <div className="monitor-tabs">
      <div className="monitor-tabs__inner">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => onChange(key)}
            className={`monitor-tab ${activeTab === key ? 'monitor-tab--active' : ''}`}>
            {label}
            <span className="monitor-tab__count">
              {studentsByTab[key].length}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
