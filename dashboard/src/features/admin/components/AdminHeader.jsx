import { Link } from 'react-router-dom';
import { auth } from '@/shared/lib/firebase';

export default function AdminHeader({ activeSection, loading, onRefresh }) {
  const email = auth.currentUser?.email ?? '';

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <div className="topbar__title">
          <div className="brand-mark" />
          <div>
            <p className="brand-title">ExamLock</p>
            <p className="brand-subtitle">Administración</p>
          </div>
        </div>
        <div className="topbar__actions">
          <Link to="/admin/users" className={`btn ${activeSection === 'users' ? 'btn btn-primary' : 'btn btn-ghost'}`}>
            Usuarios
          </Link>
          <Link to="/admin/monitoring" className={`btn ${activeSection === 'monitoring' ? 'btn btn-primary' : 'btn btn-ghost'}`}>
            Monitoreo
          </Link>
          <span className="topbar__email">{email}</span>
          <button type="button" onClick={onRefresh} disabled={loading} className="btn btn-ghost">
            {loading ? 'Cargando...' : 'Actualizar'}
          </button>
          <button type="button" onClick={() => auth.signOut()} className="btn btn-link">
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
