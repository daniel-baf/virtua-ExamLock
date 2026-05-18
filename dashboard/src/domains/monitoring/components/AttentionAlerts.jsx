export default function AttentionAlerts({ alerts, onAcknowledge, onFocusStudent }) {
  if (!alerts.length) return null;

  return (
    <section className="attention-alerts" aria-label="Alertas activas de supervision">
      <div className="attention-alerts__header">
        <div>
          <p className="attention-alerts__kicker">Requiere atencion</p>
          <h2 className="attention-alerts__title">{alerts.length} alerta(s) sin revisar</h2>
        </div>
        <p className="attention-alerts__copy">Estas alertas siguen visibles hasta que el docente haga clic en "Marcar revisada".</p>
      </div>

      <div className="attention-alerts__list">
        {alerts.map(alert => (
          <article key={alert.id} className={`attention-alert attention-alert--${alert.level ?? 'warning'}`}>
            <div className="attention-alert__body">
              <p className="attention-alert__student">{alert.studentLabel}</p>
              <p className="attention-alert__message">{alert.message}</p>
              {alert.meta && <p className="attention-alert__meta">{alert.meta}</p>}
            </div>

            <div className="attention-alert__actions">
              {alert.studentUid && (
                <button
                  type="button"
                  className="attention-alert__btn attention-alert__btn--ghost"
                  onClick={() => onFocusStudent(alert.studentUid)}
                >
                  Ver alumno
                </button>
              )}
              <button
                type="button"
                className="attention-alert__btn attention-alert__btn--primary"
                onClick={() => onAcknowledge(alert.id)}
              >
                Marcar revisada
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
