import useLoginForm from '@auth/hooks/useLoginForm';
import styles from '@auth/LoginPage.module.css';

export default function LoginPage() {
  const form = useLoginForm();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className="brand-mark" />
          <div>
            <p className="brand-title">ExamLock</p>
            <p className="brand-subtitle">Panel docente</p>
          </div>
        </div>
      </header>

      <main className={styles.layout}>
        <section className={styles.intro}>
          <div>
            <div className={styles.kicker}>Consola de supervision</div>
            <h1 className={styles.heading}>
              Supervision clara para examenes en laboratorio.
            </h1>
            <p className={styles.copy}>
              Control de red, capturas bajo demanda, evidencia historica y estado de alumnos desde una sola consola.
            </p>
            <p>
              Por: Daniel Bautista y Diego Abdo
            </p>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <strong>Tiempo real</strong>
              <p className="mt-1">Socket docente activo</p>
            </div>
            <div className={styles.stat}>
              <strong>Evidencia</strong>
              <p className="mt-1">Capturas y auditoria</p>
            </div>
            <div className={styles.stat}>
              <strong>Red</strong>
              <p className="mt-1">Whitelist por sesion</p>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelInner}>
            <div className={styles.mobileTitle}>
              <p className={styles.eyebrow}>Consola de supervision</p>
              <h1>Iniciar sesion</h1>
              <p className={styles.mobileCopy}>Accede al panel docente de ExamLock.</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <p className={styles.eyebrow}>Acceso</p>
                <h2>Iniciar sesion</h2>
              </div>

              <form onSubmit={form.submit} className={styles.form}>
                {form.error && <div className={styles.error}>{form.error}</div>}

                <Field label="Email">
                  <input type="email" required autoFocus value={form.email} onChange={e => form.setEmail(e.target.value)}
                    className={styles.input} />
                </Field>

                <Field label="Contrasena">
                  <input type="password" required value={form.password} onChange={e => form.setPassword(e.target.value)}
                    className={styles.input} />
                </Field>

                <button type="submit" disabled={form.loading} className={styles.submit}>
                  {form.loading ? 'Ingresando...' : 'Entrar al panel'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
