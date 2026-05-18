import { useState } from 'react';
import UserRoleBadge from './UserRoleBadge';
import UserStatusBadge from './UserStatusBadge';

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
    <tr className="users-row">
      <td className="users-row__primary">{user.email}</td>
      <td className="users-row__secondary">{user.displayName || '—'}</td>
      <td>
        <UserRoleBadge role={user.role} />
      </td>
      <td>
        <UserStatusBadge disabled={user.disabled} />
      </td>
      <td>
        <div className="users-row__actions">
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
