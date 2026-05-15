import useLoginForm from './hooks/useLoginForm';
import './LoginPage.css';

export default function LoginPage() {
  const form = useLoginForm();

  return (
    <div className="auth-page">
      <header className="auth-header">
        <div className="auth-header__inner">
          <div className="brand-mark" />
          <div>
            <p className="brand-title">ExamLock</p>
            <p className="brand-subtitle">Panel docente</p>
          </div>
        </div>
      </header>

      <main className="auth-layout">
        <section className="auth-intro">
          <div>
            <div className="auth-kicker">Consola de supervision</div>
            <h1 className="auth-heading">
              Supervision clara para examenes en laboratorio.
            </h1>
            <p className="auth-copy">
              Control de red, capturas bajo demanda, evidencia historica y estado de alumnos desde una sola consola.
            </p>
            <p>
              Por: Daniel Bautista y Diego Abdo
            </p>
          </div>

          <div className="auth-stats">
            <div className="auth-stat">
              <strong>Tiempo real</strong>
              <p className="mt-1">Socket docente activo</p>
            </div>
            <div className="auth-stat">
              <strong>Evidencia</strong>
              <p className="mt-1">Capturas y auditoria</p>
            </div>
            <div className="auth-stat">
              <strong>Red</strong>
              <p className="mt-1">Whitelist por sesion</p>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel__inner">
            <div className="auth-mobile-title">
              <p>Consola de supervision</p>
              <h1>Iniciar sesion</h1>
              <p>Accede al panel docente de ExamLock.</p>
            </div>

            <div className="auth-card">
              <div className="auth-card__header">
                <p>Acceso</p>
                <h2>Iniciar sesion</h2>
              </div>

              <form onSubmit={form.submit} className="auth-form">
                {form.error && <div className="auth-error">{form.error}</div>}

                <Field label="Email">
                  <input type="email" required autoFocus value={form.email} onChange={e => form.setEmail(e.target.value)}
                    className="auth-input" />
                </Field>

                <Field label="Contrasena">
                  <input type="password" required value={form.password} onChange={e => form.setPassword(e.target.value)}
                    className="auth-input" />
                </Field>

                <button type="submit" disabled={form.loading} className="auth-submit">
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
    <label className="auth-field">
      <span className="auth-field__label">{label}</span>
      {children}
    </label>
  );
}
