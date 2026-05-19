import { useState } from 'react';
import Button from '@shared/ui/Button';
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
          <Button type="button" onClick={() => onEdit(user)} variant="ghost">
            Editar
          </Button>
          <Button
            type="button"
            onClick={() => onToggleDisabled(user.uid, !user.disabled)}
            variant="ghost"
          >
            {user.disabled ? 'Habilitar' : 'Deshabilitar'}
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            variant={confirming ? 'danger' : 'ghost'}
          >
            {confirming ? 'Confirmar borrado' : 'Eliminar'}
          </Button>
        </div>
      </td>
    </tr>
  );
}
