import { useState } from 'react';
import { AdminHeader } from '@admin';
import useMonitoringSettings from '@admin/hooks/useMonitoringSettings';
import { formatStreamConfig, resetSessionsData } from '@sessions';
import { AlertBanner, Button, CardPanel, PageSection } from '@shared/ui';
import styles from './MonitoringSettingsPage.module.css';

export default function MonitoringSettingsPage() {
  const settings = useMonitoringSettings();
  const [resetting, setResetting] = useState(false);

  async function handleResetDb() {
    if (!confirm('Borrar TODOS los datos (sesiones, estudiantes, respuestas, preguntas)?')) return;
    setResetting(true);
    try {
      await resetSessionsData();
    } catch (e) {
      alert('Error al resetear: ' + e.message);
    } finally {
      setResetting(false);
    }
  }

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
        <PageSection title="Zona peligrosa" />

        <CardPanel className={styles.card}>
          <p className={styles.summaryHelp}>
            Elimina todas las sesiones, estudiantes, respuestas y preguntas. Acción irreversible.
          </p>
          <div className={styles.actions}>
            <Button onClick={handleResetDb} disabled={resetting} variant="danger">
              {resetting ? 'Borrando...' : 'Reset DB'}
            </Button>
          </div>
        </CardPanel>
      </main>
    </div>
  );
}
