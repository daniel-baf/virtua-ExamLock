import { useState } from 'react';
import AdminHeader from '@admin/components/AdminHeader';
import useUsers from '@users/hooks/useUsers';
import UserTable from '@users/components/UserTable';
import UserForm from '@users/components/UserForm';
import UsersToolbar from '@users/components/UsersToolbar';
import styles from '@users/styles/Users.module.css';

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
    <div className={styles.pageShell}>
      <AdminHeader activeSection="users" loading={loading} onRefresh={refresh} />

      <main className={styles.content}>
        <UsersToolbar onCreate={openCreate} />

        {error && <div className={styles.alertError}>{error}</div>}

        {loading ? (
          <div className={styles.loadingState}><p>Cargando usuarios…</p></div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>Sin usuarios aún.</p>
            <p className={styles.emptyCopy}>Crea uno para comenzar.</p>
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
