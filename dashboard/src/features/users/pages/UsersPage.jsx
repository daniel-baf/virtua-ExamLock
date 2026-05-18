import { useState } from 'react';
import { Link } from 'react-router-dom';
import useUsers from '../hooks/useUsers';
import UserRow from '../components/UserRow';
import UserForm from '../components/UserForm';
import { auth } from '@/shared/lib/firebase';
import '@/features/sessions/Sessions.css';

export default function UsersPage() {
  const { users, loading, error, create, update, remove, refresh } = useUsers();
  const [formTarget, setFormTarget] = useState(null); // null=hidden, false=new, obj=edit

  function openCreate() { setFormTarget(false); }
  function openEdit(user) { setFormTarget(user); }
  function closeForm() { setFormTarget(null); }

  async function handleSave(...args) {
    if (formTarget === false) {
      await create(args[0]);
    } else {
      await update(args[0], args[1]);
    }
    closeForm();
  }

  async function handleDelete(uid) {
    try { await remove(uid); } catch (err) { alert(err.message); }
  }

  async function handleToggleDisabled(uid, disabled) {
    try { await update(uid, { disabled }); } catch (err) { alert(err.message); }
  }

  const email = auth.currentUser?.email ?? '';

  return (
    <div className="page-shell">
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
            <Link to="/admin/users" className="btn btn-primary">Usuarios</Link>
            <Link to="/admin/monitoring" className="btn btn-ghost">Monitoreo</Link>
            <span className="topbar__email">{email}</span>
            <button onClick={refresh} disabled={loading} className="btn btn-ghost">
              {loading ? 'Cargando...' : 'Actualizar'}
            </button>
            <button onClick={() => auth.signOut()} className="btn btn-link">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="section-title">
          <h2 className="text-xl font-semibold">Usuarios</h2>
          <button onClick={openCreate} className="btn btn-primary">
            + Crear usuario
          </button>
        </div>

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state"><p>Cargando usuarios…</p></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p className="text-lg">Sin usuarios aún.</p>
            <p className="mt-1 text-sm">Crea uno para comenzar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-700 text-left">
                  <th className="pb-2 pr-4 text-sm font-medium text-zinc-500">Correo</th>
                  <th className="pb-2 pr-4 text-sm font-medium text-zinc-500">Nombre</th>
                  <th className="pb-2 pr-4 text-sm font-medium text-zinc-500">Rol</th>
                  <th className="pb-2 pr-4 text-sm font-medium text-zinc-500">Estado</th>
                  <th className="pb-2 text-sm font-medium text-zinc-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <UserRow
                    key={u.uid}
                    user={u}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleDisabled={handleToggleDisabled}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {formTarget !== null && (
        <UserForm
          user={formTarget || null}
          onSave={handleSave}
          onCancel={closeForm}
        />
      )}
    </div>
  );
}
