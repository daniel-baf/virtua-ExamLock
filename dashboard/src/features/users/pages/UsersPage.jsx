import { useState } from 'react';
import AdminHeader from '@/features/admin/components/AdminHeader';
import useUsers from '../hooks/useUsers';
import UserTable from '../components/UserTable';
import UserForm from '../components/UserForm';
import UsersToolbar from '../components/UsersToolbar';
import '@/features/sessions/Sessions.css';
import '../styles/Users.css';

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

  return (
    <div className="page-shell">
      <AdminHeader activeSection="users" loading={loading} onRefresh={refresh} />

      <main className="content">
        <UsersToolbar onCreate={openCreate} />

        {error && <div className="alert-error">{error}</div>}

        {loading ? (
          <div className="loading-state"><p>Cargando usuarios…</p></div>
        ) : users.length === 0 ? (
          <div className="empty-state">
            <p className="text-lg">Sin usuarios aún.</p>
            <p className="mt-1 text-sm">Crea uno para comenzar.</p>
          </div>
        ) : (
          <UserTable
            users={users}
            onEdit={openEdit}
            onDelete={handleDelete}
            onToggleDisabled={handleToggleDisabled}
          />
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
