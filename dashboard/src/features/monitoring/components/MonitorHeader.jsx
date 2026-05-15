import { Link } from 'react-router-dom';
import Metric from './Metric';

export default function MonitorHeader({
  session,
  sessionLoading,
  connected,
  totals,
  captureAllBusy,
  captureAllNote,
  examEnded,
  onCaptureAll,
  onToggleNetwork,
  onEndExam,
}) {
  return (
    <header className="monitor-header">
      <div className="monitor-header__inner">
        <div className="monitor-header__title">
          <Link to="/dashboard" className="monitor-header__back">Volver</Link>
          <div className={`monitor-header__connection ${connected ? 'monitor-header__connection--online' : 'monitor-header__connection--offline'}`} />
          <div className="min-w-0">
            <h1 className="monitor-header__heading">{session?.name ?? 'Monitor de examen'}</h1>
            <p className="monitor-header__subheading">
              {connected ? 'Canal docente conectado' : 'Canal docente desconectado'}
            </p>
          </div>
        </div>

        <div className="monitor-header__actions">
          <div className="monitor-session-code" aria-label={`Codigo de sesion ${session?.code ?? ''}`}>
            <span className="monitor-session-code__label">Codigo</span>
            <code className="monitor-session-code__value">
              {sessionLoading ? 'Cargando' : session?.code ?? 'No disponible'}
            </code>
          </div>
          <Metric label="Total" value={totals.all} />
          <Metric label="Activos" value={totals.active} tone="emerald" />
          <Metric label="Alertas" value={totals.alerts} tone="amber" />
          <button onClick={onCaptureAll} disabled={captureAllBusy || totals.active === 0}
            className="toolbar-btn toolbar-btn--info">
            {captureAllBusy ? 'Solicitando...' : 'Capturar todos'}
          </button>
          <button onClick={onToggleNetwork}
            className="toolbar-btn toolbar-btn--neutral">
            Red
          </button>
          <button onClick={onEndExam} disabled={examEnded}
            className="toolbar-btn toolbar-btn--danger">
            {examEnded ? 'Terminado' : 'Terminar'}
          </button>
        </div>
      </div>
      {captureAllNote && <p className="monitor-note">{captureAllNote}</p>}
    </header>
  );
}
