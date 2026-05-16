import DomainList from '@/features/sessions/components/DomainList';

export default function NetworkPanel({
  domains,
  blockInternet,
  saving,
  defaultLoading,
  activeCount,
  onDomainsChange,
  onToggleBlockInternet,
  onLoadDefault,
  onApply,
}) {
  return (
    <div className="network-panel">
      <div className="network-panel__inner">
        <div className="network-panel__header">
          <div>
            <h3 className="network-panel__title">Control de red</h3>
            <p className="network-panel__copy">
              {blockInternet
                ? activeCount > 0
                  ? `${activeCount} dominio(s) activo(s).`
                  : 'Bloqueo total: no hay dominios permitidos.'
                : 'La sesion tiene acceso libre a internet.'}
            </p>
          </div>
          <button onClick={onToggleBlockInternet}
            className={`network-toggle ${blockInternet ? 'network-toggle--restricted' : 'network-toggle--open'}`}>
            {blockInternet ? 'Internet restringido' : 'Internet libre'}
          </button>
        </div>
        {blockInternet && (
          <DomainList
            domains={domains}
            onChange={onDomainsChange}
            onLoadDefault={onLoadDefault}
            defaultLoading={defaultLoading}
          />
        )}
        <button onClick={onApply} disabled={saving} className="toolbar-btn toolbar-btn--neutral">
          {saving ? 'Aplicando...' : 'Aplicar red'}
        </button>
      </div>
    </div>
  );
}
