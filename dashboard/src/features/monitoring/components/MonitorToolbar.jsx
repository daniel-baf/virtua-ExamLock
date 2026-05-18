const FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'attention', label: 'Atención' },
  { value: 'offline', label: 'Offline' },
  { value: 'closed', label: 'Cerrados' },
  { value: 'stream', label: 'Stream' },
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
        <label className="monitor-search">
          <span className="monitor-search__label">Buscar alumno</span>
          <input
            value={search}
            onChange={event => onSearchChange(event.target.value)}
            placeholder="Nombre, correo o ID"
          />
        </label>

        <label className="monitor-select">
          <span>Filtro</span>
          <select value={filter} onChange={event => onFilterChange(event.target.value)}>
            {FILTERS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="monitor-toolbar__toggle-group">
          <span className="monitor-select__label">Grid</span>
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
            <span className="monitor-select__label">Vista</span>
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

      <p className="monitor-toolbar__summary">
        {visibleCount} alumno(s) visibles en esta vista.
      </p>
    </section>
  );
}
