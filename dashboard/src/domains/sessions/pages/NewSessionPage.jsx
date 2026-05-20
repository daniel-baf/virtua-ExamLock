import { useEffect, useState } from 'react';
import { DomainList } from '@sessions';
import useNewSessionForm from '@sessions/hooks/useNewSessionForm';
import { api } from '@/shared/lib/api';
import { AlertBanner, Button, CardPanel, PageHeader } from '@shared/ui';
import styles from './NewSessionPage.module.css';

export default function NewSessionPage() {
  const form = useNewSessionForm();
  const [globalPresets, setGlobalPresets] = useState([]);

  useEffect(() => {
    api.getGlobalDomainPresets().then(setGlobalPresets).catch(() => {});
  }, []);

  return (
    <div className={styles.pageShell}>
      <PageHeader backTo="/dashboard" narrow title="Nueva sesion" />

      <form onSubmit={form.submit} className={styles.content}>
        {form.error && <AlertBanner>{form.error}</AlertBanner>}

        <CardPanel className={styles.card}>
          <h3>Configuracion</h3>
          <div className={styles.field}>
            <label>Nombre de la sesión</label>
            <input value={form.name} onChange={e => form.setName(e.target.value)} required className={styles.control}
              placeholder="Ej: Cálculo I — Sección B"
            />
          </div>
          <div className={`${styles.field} ${styles.fieldShort}`}>
            <label>Tiempo límite (minutos)</label>
            <input type="number" min={5} max={300} value={form.timeLimit} className={styles.control}
              onChange={e => form.setTimeLimit(Number(e.target.value))}
            />
          </div>
        </CardPanel>

        <CardPanel className={styles.card}>
          <div className={styles.networkRow}>
            <h3>Control de internet</h3>
            <label className={styles.toggle}>
              <span className={styles.toggleLabel}>{form.blockInternet ? 'Restringido' : 'Libre'}</span>
              <div className="relative">
                <input type="checkbox" checked={form.blockInternet} onChange={e => form.setBlockInternet(e.target.checked)}
                  className="sr-only" />
                <div onClick={() => form.setBlockInternet(v => !v)}
                  className={`${styles.toggleTrack} ${form.blockInternet ? styles.toggleTrackOn : ''}`} />
              </div>
            </label>
          </div>

          {form.blockInternet && (
            <div>
              <div className={styles.field}>
                <label>Dominios permitidos</label>
                <DomainList
                  domains={form.domains}
                  onChange={form.setDomains}
                  onLoadDefault={form.loadDefaultDomains}
                  defaultLoading={form.defaultLoading}
                  globalPresets={globalPresets}
                />
              </div>
              <p className={styles.formHelp}>DNS + localhost siempre permitidos.</p>
            </div>
          )}
        </CardPanel>

        <Button type="submit" disabled={form.saving} variant="primary" className={styles.submit}>
          {form.saving ? 'Creando sesión...' : 'Crear sesión'}
        </Button>
      </form>
    </div>
  );
}
