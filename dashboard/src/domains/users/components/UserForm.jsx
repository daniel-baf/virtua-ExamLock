import { useEffect, useState } from 'react';
import { AlertBanner, Button, CardPanel } from '@shared/ui';
import { USER_ROLE_LABELS } from '@users/constants/userRoles';
import {
  buildNewUserPayload,
  buildUserUpdates,
  createUserFormState,
  friendlyUserError,
} from '@users/helpers/userFormModel';
import UserFormField from '@users/components/UserFormField';
import styles from '@users/styles/Users.module.css';

export default function UserForm({ user, onSave, onCancel }) {
  const isNew = !user;
  const [form, setForm] = useState(createUserFormState(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(createUserFormState(user));
    setError('');
  }, [user]);

  function set(field) {
    return event => {
      setForm(current => ({ ...current, [field]: event.target.value }));
    };
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (isNew) {
        await onSave(buildNewUserPayload(form));
      } else {
        await onSave(user.uid, buildUserUpdates(form));
      }
    } catch (err) {
      setError(friendlyUserError(err.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.dialogBackdrop}>
      <CardPanel className={styles.dialog}>
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{isNew ? 'Crear usuario' : 'Editar usuario'}</h2>
          <p className={styles.dialogCopy}>
            {isNew
              ? 'Crea una cuenta nueva y asigna su rol desde aquí.'
              : 'Actualiza el nombre visible o cambia el rol del usuario.'}
          </p>
        </div>

        <form onSubmit={submit} className={styles.form}>
          {isNew && (
            <UserFormField label="Correo electrónico" htmlFor="user-email">
              <input
                id="user-email"
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                className={styles.control}
                placeholder="usuario@ejemplo.com"
              />
            </UserFormField>
          )}

          {isNew && (
            <UserFormField label="Contraseña" htmlFor="user-password" hint="Mínimo 6 caracteres.">
              <input
                id="user-password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
                className={styles.control}
                placeholder="Ingresa una contraseña segura"
              />
            </UserFormField>
          )}

          <div className={styles.formGrid}>
            <UserFormField label="Nombre" htmlFor="user-display-name">
              <input
                id="user-display-name"
                type="text"
                value={form.displayName}
                onChange={set('displayName')}
                className={styles.control}
                placeholder="Nombre completo"
              />
            </UserFormField>

            <UserFormField label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                value={form.role}
                onChange={set('role')}
                className={`${styles.control} ${styles.controlSelect}`}
              >
                {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </UserFormField>
          </div>

          {error && <AlertBanner className={styles.formError}>{error}</AlertBanner>}

          <div className={styles.formActions}>
            <Button type="button" onClick={onCancel} variant="ghost" className={styles.formActionButton}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} variant="primary" className={styles.formActionButton}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardPanel>
    </div>
  );
}
