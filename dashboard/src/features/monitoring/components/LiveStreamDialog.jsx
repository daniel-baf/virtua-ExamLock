export default function LiveStreamDialog({ student, frameSrc, status, error, takenAt, onClose }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const statusText = {
    connecting: 'Conectando...',
    live: 'En vivo',
    ready: 'Preparado',
    error: 'Error de stream',
    stopped: 'Stream detenido',
  }[status] ?? 'Conectando...';

  return (
    <div className="live-stream-backdrop" role="dialog" aria-modal="true">
      <section className="live-stream-panel">
        <header className="live-stream-header">
          <div>
            <h3>{label}</h3>
            <p>{statusText}{takenAt ? ` · ${new Date(takenAt).toLocaleTimeString()}` : ''}</p>
          </div>
          <button onClick={onClose} className="live-stream-close">Cerrar</button>
        </header>

        <div className="live-stream-view">
          {frameSrc ? (
            <img src={frameSrc} alt={`Pantalla en vivo de ${label}`} />
          ) : (
            <div className="live-stream-placeholder">{error || statusText}</div>
          )}
          {error && <div className="live-stream-error">{error}</div>}
        </div>
      </section>
    </div>
  );
}
