import { activeDomainCount, normalizeDomainList } from '@sessions/domainModel';
import styles from './SessionCard.module.css';

export default function SessionWhitelistTable({ session }) {
  const domains = normalizeDomainList(session.whitelist ?? []);
  const activeCount = activeDomainCount(domains);

  if (!session.blockInternet) {
    return (
      <div className={styles.whitelistBox}>
        Esta sesion tiene acceso libre a internet.
      </div>
    );
  }

  return (
    <div className={styles.whitelistBox}>
      <div className={styles.whitelistSummary}>
        <p>Dominios permitidos</p>
        <p className={styles.whitelistMeta}>
          {domains.length > 0
            ? `${activeCount} activo(s), ${domains.length - activeCount} apagado(s)`
            : 'Sin dominios configurados; el bloqueo es total.'}
        </p>
      </div>

      {domains.length === 0 ? (
        <div className={styles.whitelistEmpty}>No hay dominios permitidos para esta sesion.</div>
      ) : (
        <table className={styles.whitelistTable}>
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
