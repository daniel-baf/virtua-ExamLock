export default function SessionWhitelistTable({ session }) {
  const domains = session.whitelist ?? [];

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
          {domains.length > 0 ? `${domains.length} dominio(s) configurado(s)` : 'Sin dominios configurados; el bloqueo es total.'}
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
            {domains.map((domain, index) => (
              <tr key={`${session.sessionId}-${domain}`}>
                <td>{index + 1}</td>
                <td>{domain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
