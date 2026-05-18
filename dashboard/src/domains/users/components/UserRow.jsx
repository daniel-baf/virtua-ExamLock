import { useState } from 'react';
import UserRoleBadge from '@users/components/UserRoleBadge';
import UserStatusBadge from '@users/components/UserStatusBadge';
import styles from '@users/styles/Users.module.css';

export default function UserRow({ user, onEdit, onDelete, onToggleDisabled }) {
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setConfirming(false);
    onDelete(user.uid);
  }

  return (
    <tr className={styles.row}>
      <td className={styles.primary}>{user.email}</td>
      <td className={styles.secondary}>{user.displayName || '—'}</td>
      <td>
        <UserRoleBadge role={user.role} />
      </td>
      <td>
        <UserStatusBadge disabled={user.disabled} />
      </td>
      <td>
        <div className={styles.actions}>
          <button type="button" onClick={() => onEdit(user)} className="btn btn-ghost">
            Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleDisabled(user.uid, !user.disabled)}
            className="btn btn-ghost"
          >
            {user.disabled ? 'Habilitar' : 'Deshabilitar'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            className={`btn ${confirming ? 'btn-danger' : 'btn-ghost'}`}
          >
            {confirming ? 'Confirmar borrado' : 'Eliminar'}
          </button>
        </div>
      </td>
    </tr>
  );
}
