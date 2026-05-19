import { useEffect, useRef, useState } from 'react';
import AuthImage from '@shared/components/AuthImage';
import { liveStatusLabel } from '@monitoring/monitoringModel';
import styles from '@monitoring/components/LiveStreamDialog.module.css';

function KeystrokePanel({ keystrokes }) {
  const bottomRef = useRef(null);
  const [localLog, setLocalLog] = useState(keystrokes ?? []);

  useEffect(() => {
    setLocalLog(keystrokes ?? []);
  }, [keystrokes]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localLog.length]);

  function renderEvent(ev, idx) {
    if (ev.type === 'special') {
      return <span key={idx} className={styles.keyChip}>{ev.name}</span>;
    }
    if (ev.type === 'char') {
      if (ev.ch === ' ') return <span key={idx} className={styles.keySpace}>·</span>;
      return <span key={idx}>{ev.ch}</span>;
    }
    return null;
  }

  return (
    <div className={styles.keystrokePanel}>
      <div className={styles.keystrokeHeader}>
        <span className={styles.keystrokeTitle}>Teclas</span>
        <span className={`${styles.toggleButton} ${styles.toggleOn}`}>⌨ Activo</span>
        <button
          type="button"
          className={styles.clearButton}
          onClick={() => setLocalLog([])}
          title="Limpiar vista local"
        >
          ✕
        </button>
      </div>
      <div className={styles.keystrokeBody}>
        {localLog.length === 0 ? (
          <p className={styles.keystrokePlaceholder}>Esperando teclas…</p>
        ) : (
          <p className={styles.keystrokeText}>
            {localLog.map((ev, i) => renderEvent(ev, i))}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function LogPanel({ logs }) {
  const bottomRef = useRef(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs?.length]);

  return (
    <div className={styles.logPanel}>
      {!logs?.length ? (
        <p className={styles.keystrokePlaceholder}>Sin logs del daemon aún.</p>
      ) : (
        logs.map((line, i) => (
          <div key={i} className={styles.logLine}>
            <span className={styles.logTag}>[{line.tag}]</span>
            <span className={styles.logMsg}>{line.msg}</span>
          </div>
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default function LiveStreamDialog({ student, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const statusText = liveStatusLabel(student.streamStatus);
  const [tab, setTab] = useState('screen'); // 'screen' | 'logs'

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true">
      <section className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h3 className={styles.title}>{label}</h3>
            <p className={styles.subtitle}>{statusText}{student.liveTakenAt ? ` · ${new Date(student.liveTakenAt).toLocaleTimeString()}` : ''}</p>
          </div>
          <div className={styles.tabs}>
            <button onClick={() => setTab('screen')} className={`${styles.tabButton} ${tab === 'screen' ? styles.tabActive : ''}`}>Pantalla</button>
            <button onClick={() => setTab('logs')} className={`${styles.tabButton} ${tab === 'logs' ? styles.tabActive : ''}`}>
              Logs {student.daemonLogs?.length ? `(${student.daemonLogs.length})` : ''}
            </button>
          </div>
          <div className={styles.actions}>
            <button onClick={onCapture} className={`${styles.actionButton} ${styles.infoButton}`}>Capturar</button>
            <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
          </div>
        </header>

        {tab === 'screen' ? (
          <div className={styles.viewRow}>
            <div className={styles.view}>
              {student.liveFrame ? (
                <img src={student.liveFrame} alt={`Pantalla en vivo de ${label}`} className={styles.image} />
              ) : student.screenUrl ? (
                <AuthImage uid={student.uid} src={student.screenUrl} alt={`Pantalla en vivo de ${label}`} className={styles.image} />
              ) : (
                <div className={styles.placeholder}>{student.streamError || statusText}</div>
              )}
              {student.streamError && <div className={styles.error}>{student.streamError}</div>}
            </div>

            <KeystrokePanel keystrokes={student.keystrokes} />
          </div>
        ) : (
          <LogPanel logs={student.daemonLogs} />
        )}
      </section>
    </div>
  );
}
