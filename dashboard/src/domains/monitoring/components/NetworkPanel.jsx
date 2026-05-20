import { useEffect, useState } from 'react';
import { DomainList } from '@sessions';
import { api } from '@/shared/lib/api';
import styles from '@monitoring/components/NetworkPanel.module.css';

export default function NetworkPanel({
  domains,
  blockInternet,
  saving,
  defaultLoading,
  activeCount,
  onDomainsChange,
  onToggleBlockInternet,
  onLoadDefault,
  onApply,
}) {
  const [globalPresets, setGlobalPresets] = useState([]);

  useEffect(() => {
    api.getGlobalDomainPresets().then(setGlobalPresets).catch(() => {});
  }, []);
  return (
    <div className={styles.panel}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Control de red</h3>
            <p className={styles.copy}>
              {blockInternet
                ? activeCount > 0
                  ? `${activeCount} dominio(s) activo(s).`
                  : 'Bloqueo total: no hay dominios permitidos.'
                : 'La sesion tiene acceso libre a internet.'}
            </p>
          </div>
          <button
            onClick={onToggleBlockInternet}
            className={`${styles.toggle} ${blockInternet ? styles.restricted : styles.open}`}
          >
            {blockInternet ? 'Internet restringido' : 'Internet libre'}
          </button>
        </div>
        {blockInternet && (
          <DomainList
            domains={domains}
            onChange={onDomainsChange}
            onLoadDefault={onLoadDefault}
            defaultLoading={defaultLoading}
            globalPresets={globalPresets}
          />
        )}
        <button onClick={onApply} disabled={saving} className={styles.applyButton}>
          {saving ? 'Aplicando...' : 'Aplicar red'}
        </button>
      </div>
    </div>
  );
}
