import { Link } from 'react-router-dom';
import { formatStreamConfig } from '../streamConfigModel';
import SessionWhitelistTable from './SessionWhitelistTable';

export default function SessionCard({ session }) {
  return (
    <article className="session-card">
      <div className="session-card__header">
        <div className="min-w-0">
          <div className="session-card__title">
            <p className="session-card__name">{session.name}</p>
            <StatusBadge active={session.active} />
            <NetworkBadge blocked={session.blockInternet} />
          </div>
          <div className="session-code-panel" aria-label={`Codigo de sesion ${session.code}`}>
            <span className="session-code-panel__label">Codigo de sesion</span>
            <code className="session-code-panel__value">{session.code}</code>
          </div>
          <p className="session-card__meta">
            {new Date(session.createdAt).toLocaleDateString('es', { dateStyle: 'medium' })}
          </p>
          <p className="session-card__meta">Stream: {formatStreamConfig(session.streamConfig)}</p>
        </div>

        <div className="session-card__actions">
          <Link to={`/session/${session.sessionId}/monitor`} className="link-btn">
            Monitor
          </Link>
          <Link to={`/session/${session.sessionId}/audit`} className="link-btn">
            Auditoria
          </Link>
        </div>
      </div>

      <SessionWhitelistTable session={session} />
    </article>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`badge ${active ? 'badge--ok' : 'badge--neutral'}`}>
      {active ? 'activa' : 'terminada'}
    </span>
  );
}

function NetworkBadge({ blocked }) {
  return (
    <span className={`badge ${blocked ? 'badge--warning' : 'badge--neutral'}`}>
      {blocked ? 'internet restringido' : 'internet libre'}
    </span>
  );
}
