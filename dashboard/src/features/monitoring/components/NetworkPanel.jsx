import DomainList from '@/features/sessions/components/DomainList';

export default function NetworkPanel({
  domains,
  blockInternet,
  saving,
  onDomainsChange,
  onToggleBlockInternet,
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
                ? domains.length > 0
                  ? `${domains.length} dominio(s) permitido(s).`
                  : 'Bloqueo total: no hay dominios permitidos.'
                : 'La sesion tiene acceso libre a internet.'}
            </p>
          </div>
          <button onClick={onToggleBlockInternet}
            className={`network-toggle ${blockInternet ? 'network-toggle--restricted' : 'network-toggle--open'}`}>
            {blockInternet ? 'Internet restringido' : 'Internet libre'}
          </button>
        </div>
        {blockInternet && <DomainList domains={domains} onChange={onDomainsChange} />}
        <button onClick={onApply} disabled={saving} className="toolbar-btn toolbar-btn--neutral">
          {saving ? 'Aplicando...' : 'Aplicar red'}
        </button>
      </div>
    </div>
  );
}
