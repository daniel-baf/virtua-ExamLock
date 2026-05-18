import styles from '@monitoring/components/MonitorToolbar.module.css';

const FILTERS = [
  { value: 'all', label: 'Mostrar: Todos' },
  { value: 'attention', label: 'Mostrar: Atención' },
  { value: 'offline', label: 'Mostrar: Offline' },
  { value: 'closed', label: 'Mostrar: Cerrados' },
  { value: 'stream', label: 'Mostrar: Stream' },
];

export default function MonitorToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  columns,
  onColumnsChange,
  closedView,
  onClosedViewChange,
  showPinnedOnly,
  onTogglePinnedOnly,
  activeTab,
  visibleCount,
}) {
  return (
    <section className={styles.toolbar}>
      <div className={styles.row}>
        <label className={styles.search}>
          <input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Buscar alumno por nombre, correo o ID..."
            className={styles.searchInput}
          />
        </label>

        <div className={styles.controls}>
          <label className={styles.select}>
            <select value={filter} onChange={event => onFilterChange(event.target.value)} className={styles.selectInput}>
              {FILTERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.toggleGroup}>
            {[3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                className={`${styles.segmentedButton} ${columns === value ? styles.segmentedButtonActive : ''}`}
                onClick={() => onColumnsChange(value)}
              >
                {value} col
              </button>
            ))}
          </div>

          {activeTab === 'kicked' && (
            <div className={styles.toggleGroup}>
              {['list', 'cards'].map(value => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.segmentedButton} ${closedView === value ? styles.segmentedButtonActive : ''}`}
                  onClick={() => onClosedViewChange(value)}
                >
                  {value === 'list' ? 'Lista' : 'Cards'}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`${styles.actionButton} ${showPinnedOnly ? styles.infoButton : styles.neutralButton}`}
            onClick={onTogglePinnedOnly}
          >
            {showPinnedOnly ? 'Solo pineados' : 'Ver pineados'}
          </button>
        </div>
      </div>

      <p className={styles.summary}>
        {visibleCount} alumno(s) visibles en esta vista.
      </p>
    </section>
  );
}
