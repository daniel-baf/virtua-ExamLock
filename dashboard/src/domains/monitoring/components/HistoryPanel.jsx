import { useState } from 'react';
import AuthImage from '@shared/components/AuthImage';
import { fmtTime } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/HistoryPanel.module.css';

function ChunkView({ chunks }) {
  if (!chunks?.length) {
    return <div className={`${styles.state} ${styles.boxedState}`}>Sin texto registrado aún — llega cada 60 s.</div>;
  }

  return (
    <div className={styles.chunkList}>
      {chunks.map((chunk, i) => {
        const hasSuspicious = /\[Ctrl\+[CV]\]/i.test(chunk.text);
        const start = chunk.startedAt ? new Date(chunk.startedAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
        const end = chunk.endedAt ? new Date(chunk.endedAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
        return (
          <div key={i} className={`${styles.chunk} ${hasSuspicious ? styles.chunkSuspicious : ''}`}>
            <div className={styles.chunkMeta}>
              <span className={styles.chunkTime}>{start} – {end}</span>
              {hasSuspicious && <span className={styles.chunkBadge}>Ctrl+C/V detectado</span>}
            </div>
            <pre className={styles.chunkText}>{chunk.text}</pre>
          </div>
        );
      })}
    </div>
  );
}

export default function HistoryPanel({ student, screenshots, loading, error, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const [tab, setTab] = useState('screenshots');
  const chunks = student.keystrokeChunks ?? [];

  return (
    <div className={styles.drawer}>
      <aside className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <div>
              <p className={styles.title}>{label}</p>
              <p className={styles.subtitle}>
                {tab === 'screenshots'
                  ? `${screenshots.length} capturas registradas`
                  : `${chunks.length} bloques de texto`}
              </p>
            </div>
            <div className={styles.actions}>
              {tab === 'screenshots' && (
                <button onClick={onCapture} className={`${styles.actionButton} ${styles.infoButton}`}>Capturar ahora</button>
              )}
              <button onClick={onClose} className={styles.actionButton}>Cerrar</button>
            </div>
          </div>
          <div className={styles.tabs}>
            <button
              type="button"
              onClick={() => setTab('screenshots')}
              className={`${styles.tabButton} ${tab === 'screenshots' ? styles.tabActive : ''}`}
            >
              Capturas
            </button>
            <button
              type="button"
              onClick={() => setTab('keystrokes')}
              className={`${styles.tabButton} ${tab === 'keystrokes' ? styles.tabActive : ''}`}
            >
              Teclas {chunks.length ? `(${chunks.length})` : ''}
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {tab === 'screenshots' ? (
            <>
              {loading && <div className={styles.state}>Cargando historial...</div>}
              {error && <div className={styles.error}>{error}</div>}
              {!loading && !error && screenshots.length === 0 && (
                <div className={`${styles.state} ${styles.boxedState}`}>Sin capturas para este alumno.</div>
              )}
              {!loading && !error && screenshots.length > 0 && (
                <div className={styles.grid}>
                  {screenshots.map((shot, index) => (
                    <div key={shot.id ?? `${shot.url}-${index}`} className={styles.shot}>
                      <AuthImage uid={student.uid} src={shot.url} alt={`captura ${index + 1}`} className={styles.image} />
                      <div className={styles.meta}>
                        <span>{fmtTime(shot.takenAt)}</span>
                        <span>Vista protegida</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <ChunkView chunks={chunks} />
          )}
        </div>
      </aside>
    </div>
  );
}
