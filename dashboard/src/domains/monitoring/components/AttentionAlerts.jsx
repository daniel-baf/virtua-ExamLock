import styles from '@monitoring/components/AttentionAlerts.module.css';

export default function AttentionAlerts({ alerts, onAcknowledge, onFocusStudent }) {
  if (!alerts.length) return null;

  return (
    <section className={styles.section} aria-label="Alertas activas de supervision">
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Requiere atencion</p>
          <h2 className={styles.title}>{alerts.length} alerta(s) sin revisar</h2>
        </div>
        <p className={styles.copy}>Estas alertas siguen visibles hasta que el docente haga clic en "Marcar revisada".</p>
      </div>

      <div className={styles.list}>
        {alerts.map(alert => (
          <article
            key={alert.id}
            className={`${styles.alert} ${alert.level === 'danger' ? styles.danger : styles.warning}`}
          >
            <div className={styles.body}>
              <p className={styles.student}>{alert.studentLabel}</p>
              <p className={styles.message}>{alert.message}</p>
              {alert.meta && <p className={styles.meta}>{alert.meta}</p>}
            </div>

            <div className={styles.actions}>
              {alert.studentUid && (
                <button
                  type="button"
                  className={`${styles.button} ${styles.ghostButton}`}
                  onClick={() => onFocusStudent(alert.studentUid)}
                >
                  Ver alumno
                </button>
              )}
              <button
                type="button"
                className={`${styles.button} ${styles.primaryButton}`}
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
