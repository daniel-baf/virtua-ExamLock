import Button from '@shared/ui/Button';
import { formatStreamConfig } from '@sessions/streamConfigModel';
import SessionWhitelistTable from '@sessions/components/SessionWhitelistTable';
import styles from './SessionCard.module.css';

export default function SessionCard({ session }) {
  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className="min-w-0">
          <div className={styles.title}>
            <p className={styles.name}>{session.name}</p>
            <StatusBadge active={session.active} />
            <NetworkBadge blocked={session.blockInternet} />
          </div>
          <div className={styles.codePanel} aria-label={`Codigo de sesion ${session.code}`}>
            <span className={styles.codeLabel}>Codigo de sesion</span>
            <code className={styles.codeValue}>{session.code}</code>
          </div>
          <p className={styles.meta}>
            {new Date(session.createdAt).toLocaleDateString('es', { dateStyle: 'medium' })}
          </p>
          <p className={styles.meta}>Stream: {formatStreamConfig(session.streamConfig)}</p>
        </div>

        <div className={styles.actions}>
          <Button to={`/session/${session.sessionId}/monitor`} variant="ghost">
            Monitor
          </Button>
          <Button to={`/session/${session.sessionId}/audit`} variant="ghost">
            Auditoria
          </Button>
        </div>
      </div>

      <SessionWhitelistTable session={session} />
    </article>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`${styles.badge} ${active ? styles.badgeOk : styles.badgeNeutral}`}>
      {active ? 'activa' : 'terminada'}
    </span>
  );
}

function NetworkBadge({ blocked }) {
  return (
    <span className={`${styles.badge} ${blocked ? styles.badgeWarning : styles.badgeNeutral}`}>
      {blocked ? 'internet restringido' : 'internet libre'}
    </span>
  );
}
