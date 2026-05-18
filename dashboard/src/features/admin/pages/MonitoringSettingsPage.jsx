import { Link } from 'react-router-dom';
import { auth } from '@/shared/lib/firebase';
import { formatStreamConfig } from '@/features/sessions/streamConfigModel';
import useMonitoringSettings from '../hooks/useMonitoringSettings';
import '@/features/sessions/Sessions.css';

export default function MonitoringSettingsPage() {
  const settings = useMonitoringSettings();
  const email = auth.currentUser?.email ?? '';

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="topbar__title">
            <div className="brand-mark" />
            <div>
              <p className="brand-title">ExamLock</p>
              <p className="brand-subtitle">Administración</p>
            </div>
          </div>
          <div className="topbar__actions">
            <Link to="/admin/users" className="btn btn-ghost">Usuarios</Link>
            <Link to="/admin/monitoring" className="btn btn-primary">Monitoreo</Link>
            <span className="topbar__email">{email}</span>
            <button onClick={settings.refresh} disabled={settings.loading} className="btn btn-ghost">
              {settings.loading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button onClick={() => auth.signOut()} className="btn btn-link">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="content content--narrow">
        <div className="section-title">
          <h2 className="text-xl font-semibold">Defaults globales de stream</h2>
        </div>

        {settings.error && <div className="alert-error">{settings.error}</div>}

        <section className="form-card admin-settings-card">
          <div className="admin-settings-summary">
            <p className="admin-settings-summary__label">Aplicación</p>
            <p className="admin-settings-summary__value">{formatStreamConfig(settings.streamConfig)}</p>
            <p className="admin-settings-summary__help">
              Estos valores se copian a sesiones nuevas. No cambian sesiones ya activas.
            </p>
            {settings.updatedAt && (
              <p className="muted">Última actualización: {new Date(settings.updatedAt).toLocaleString('es')}</p>
            )}
          </div>

          <div className="field">
            <label>Resolución del stream</label>
            <select
              value={settings.streamConfig.resolutionPreset}
              onChange={e => settings.setStreamConfig(current => ({ ...current, resolutionPreset: e.target.value }))}
              disabled={settings.loading || settings.saving}
            >
              {settings.presets.resolutionPreset.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Intervalo entre frames</label>
            <select
              value={settings.streamConfig.intervalMs}
              onChange={e => settings.setStreamConfig(current => ({ ...current, intervalMs: Number(e.target.value) }))}
              disabled={settings.loading || settings.saving}
            >
              {settings.presets.intervalMs.map(option => (
                <option key={option} value={option}>{option / 1000}s</option>
              ))}
            </select>
          </div>

          <div className="admin-settings-actions">
            <button onClick={settings.save} disabled={settings.loading || settings.saving} className="btn btn-primary">
              {settings.saving ? 'Guardando...' : 'Guardar defaults'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
