import { AdminHeader } from '@admin';
import useMonitoringSettings from '@admin/hooks/useMonitoringSettings';
import { formatStreamConfig } from '@sessions';
import { AlertBanner, Button, CardPanel, PageSection } from '@shared/ui';
import styles from './MonitoringSettingsPage.module.css';

export default function MonitoringSettingsPage() {
  const settings = useMonitoringSettings();

  return (
    <div className={styles.pageShell}>
      <AdminHeader activeSection="monitoring" loading={settings.loading} onRefresh={settings.refresh} />

      <main className={styles.content}>
        <PageSection
          title="Defaults globales de stream"
          subtitle="Se copian a sesiones nuevas y no alteran sesiones ya activas."
        />

        {settings.error && <AlertBanner>{settings.error}</AlertBanner>}

        <CardPanel className={styles.card}>
          <div className={styles.summary}>
            <p className={styles.summaryLabel}>Aplicacion</p>
            <p className={styles.summaryValue}>{formatStreamConfig(settings.streamConfig)}</p>
            <p className={styles.summaryHelp}>
              Estos valores se copian a sesiones nuevas. No cambian sesiones ya activas.
            </p>
            {settings.updatedAt && (
              <p className={styles.muted}>Ultima actualizacion: {new Date(settings.updatedAt).toLocaleString('es')}</p>
            )}
          </div>

          <div className={styles.field}>
            <label>Resolución del stream</label>
            <select
              value={settings.streamConfig.resolutionPreset}
              onChange={e => settings.setStreamConfig(current => ({ ...current, resolutionPreset: e.target.value }))}
              disabled={settings.loading || settings.saving}
              className={styles.control}
            >
              {settings.presets.resolutionPreset.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label>Intervalo entre frames</label>
            <select
              value={settings.streamConfig.intervalMs}
              onChange={e => settings.setStreamConfig(current => ({ ...current, intervalMs: Number(e.target.value) }))}
              disabled={settings.loading || settings.saving}
              className={styles.control}
            >
              {settings.presets.intervalMs.map(option => (
                <option key={option} value={option}>{option / 1000}s</option>
              ))}
            </select>
          </div>

          <div className={styles.actions}>
            <Button onClick={settings.save} disabled={settings.loading || settings.saving} variant="primary">
              {settings.saving ? 'Guardando...' : 'Guardar defaults'}
            </Button>
          </div>
        </CardPanel>
      </main>
    </div>
  );
}
