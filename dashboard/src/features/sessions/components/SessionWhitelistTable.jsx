import { activeDomainCount, normalizeDomainList } from '../domainModel';

export default function SessionWhitelistTable({ session }) {
  const domains = normalizeDomainList(session.whitelist ?? []);
  const activeCount = activeDomainCount(domains);

  if (!session.blockInternet) {
    return (
      <div className="whitelist-box">
        Esta sesion tiene acceso libre a internet.
      </div>
    );
  }

  return (
    <div className="whitelist-box">
      <div className="whitelist-box__summary">
        <p>Dominios permitidos</p>
        <p>
          {domains.length > 0
            ? `${activeCount} activo(s), ${domains.length - activeCount} apagado(s)`
            : 'Sin dominios configurados; el bloqueo es total.'}
        </p>
      </div>

      {domains.length === 0 ? (
        <div className="whitelist-box__empty">No hay dominios permitidos para esta sesion.</div>
      ) : (
        <table className="whitelist-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Dominio</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((entry, index) => (
              <tr key={`${session.sessionId}-${entry.domain}`}>
                <td>{index + 1}</td>
                <td>{entry.enabled ? entry.domain : `${entry.domain} (off)`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
