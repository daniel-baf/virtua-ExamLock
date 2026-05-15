import { Link } from 'react-router-dom';
import DomainList from '@/features/sessions/components/DomainList';
import useNewSessionForm from '../hooks/useNewSessionForm';
import '../Sessions.css';

export default function NewSessionPage() {
  const form = useNewSessionForm();

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="topbar__inner content--narrow">
        <Link to="/dashboard" className="btn btn-link">Volver</Link>
        <span className="font-semibold">Nueva sesión</span>
        </div>
      </header>

      <form onSubmit={form.submit} className="content content--narrow stack">
        {form.error && <div className="alert-error">{form.error}</div>}

        <div className="form-card">
          <h3>Configuración</h3>
          <div className="field">
            <label>Nombre de la sesión</label>
            <input value={form.name} onChange={e => form.setName(e.target.value)} required
              placeholder="Ej: Cálculo I — Sección B"
            />
          </div>
          <div className="field field--short">
            <label>Tiempo límite (minutos)</label>
            <input type="number" min={5} max={300} value={form.timeLimit}
              onChange={e => form.setTimeLimit(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="form-card">
          <div className="network-row">
            <h3>Control de internet</h3>
            <label className="toggle">
              <span className="toggle__label">{form.blockInternet ? 'Restringido' : 'Libre'}</span>
              <div className="relative">
                <input type="checkbox" checked={form.blockInternet} onChange={e => form.setBlockInternet(e.target.checked)}
                  className="sr-only" />
                <div onClick={() => form.setBlockInternet(v => !v)}
                  className={`toggle__track ${form.blockInternet ? 'toggle__track--on' : ''}`} />
              </div>
            </label>
          </div>

          {form.blockInternet && (
            <div>
              <div className="field">
                <label>Dominios permitidos</label>
                <DomainList domains={form.domains} onChange={form.setDomains} />
              </div>
              <p className="form-help">DNS + localhost siempre permitidos.</p>
            </div>
          )}
        </div>

        <button type="submit" disabled={form.saving} className="btn btn-primary form-submit">
          {form.saving ? 'Creando sesión...' : 'Crear sesión'}
        </button>
      </form>
    </div>
  );
}
