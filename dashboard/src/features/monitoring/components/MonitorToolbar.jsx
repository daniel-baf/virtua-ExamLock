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
    <section className="monitor-toolbar">
      <div className="monitor-toolbar__row">
        <label className="monitor-search" style={{ flex: 1, minWidth: '280px', marginBottom: 0 }}>
          <input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Buscar alumno por nombre, correo o ID..."
            style={{ width: '100%' }}
          />
        </label>

        <div className="monitor-toolbar__controls" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label className="monitor-select" style={{ marginBottom: 0 }}>
            <select value={filter} onChange={event => onFilterChange(event.target.value)}>
              {FILTERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="monitor-toolbar__toggle-group">
            {[3, 4, 5].map(value => (
              <button
                key={value}
                type="button"
                className={`segmented-btn ${columns === value ? 'segmented-btn--active' : ''}`}
                onClick={() => onColumnsChange(value)}
              >
                {value} col
              </button>
            ))}
          </div>

          {activeTab === 'kicked' && (
            <div className="monitor-toolbar__toggle-group">
              {['list', 'cards'].map(value => (
                <button
                  key={value}
                  type="button"
                  className={`segmented-btn ${closedView === value ? 'segmented-btn--active' : ''}`}
                  onClick={() => onClosedViewChange(value)}
                >
                  {value === 'list' ? 'Lista' : 'Cards'}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`toolbar-btn ${showPinnedOnly ? 'toolbar-btn--info' : 'toolbar-btn--neutral'}`}
            onClick={onTogglePinnedOnly}
          >
            {showPinnedOnly ? 'Solo pineados' : 'Ver pineados'}
          </button>
        </div>
      </div>

      <p className="monitor-toolbar__summary">
        {visibleCount} alumno(s) visibles en esta vista.
      </p>
    </section>
  );
}
