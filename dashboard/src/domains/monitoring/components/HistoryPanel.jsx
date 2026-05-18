import AuthImage from '@/shared/components/AuthImage';
import { fmtTime } from '../monitoringModel';

export default function HistoryPanel({ student, screenshots, loading, error, onClose, onCapture }) {
  const label = student.email ?? student.name ?? student.uid.slice(0, 8);

  return (
    <div className="history-drawer">
      <aside className="history-drawer__panel">
        <div className="history-drawer__header">
          <div className="history-drawer__header-row">
            <div>
              <p className="history-drawer__title">{label}</p>
              <p className="history-drawer__subtitle">{screenshots.length} capturas registradas</p>
            </div>
            <div className="history-drawer__actions">
              <button onClick={onCapture} className="student-action student-action--info">Capturar ahora</button>
              <button onClick={onClose} className="student-action">Cerrar</button>
            </div>
          </div>
        </div>

        <div className="history-drawer__body">
          {loading && <div className="history-state">Cargando historial...</div>}
          {error && <div className="history-error">{error}</div>}
          {!loading && !error && screenshots.length === 0 && (
            <div className="history-state history-state--box">Sin capturas para este alumno.</div>
          )}
          {!loading && !error && screenshots.length > 0 && (
            <div className="history-grid">
              {screenshots.map((shot, index) => (
                <div key={shot.id ?? `${shot.url}-${index}`} className="history-shot">
                  <AuthImage uid={student.uid} src={shot.url} alt={`captura ${index + 1}`} className="protected-image history-shot__image" />
                  <div className="history-shot__meta">
                    <span>{fmtTime(shot.takenAt)}</span>
                    <span>Vista protegida</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
