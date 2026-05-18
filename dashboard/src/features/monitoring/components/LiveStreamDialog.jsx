import AuthImage from '@/shared/components/AuthImage';
import { liveStatusLabel } from '../monitoringModel';

export default function LiveStreamDialog({ student, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);
  const statusText = liveStatusLabel(student.streamStatus);

  return (
    <div className="live-stream-backdrop" role="dialog" aria-modal="true">
      <section className="live-stream-panel">
        <header className="live-stream-header">
          <div>
            <h3>{label}</h3>
            <p>{statusText}{student.liveTakenAt ? ` · ${new Date(student.liveTakenAt).toLocaleTimeString()}` : ''}</p>
          </div>
          <div className="live-stream-actions">
            <button onClick={onCapture} className="student-action student-action--info">Capturar</button>
            <button onClick={onClose} className="live-stream-close">Cerrar</button>
          </div>
        </header>

        <div className="live-stream-view">
          {student.liveFrame ? (
            <img src={student.liveFrame} alt={`Pantalla en vivo de ${label}`} />
          ) : student.screenUrl ? (
            <AuthImage uid={student.uid} src={student.screenUrl} alt={`Pantalla en vivo de ${label}`} className="protected-image" />
          ) : (
            <div className="live-stream-placeholder">{student.streamError || statusText}</div>
          )}
          {student.streamError && <div className="live-stream-error">{student.streamError}</div>}
        </div>
      </section>
    </div>
  );
}
