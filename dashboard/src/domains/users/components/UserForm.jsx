import { useEffect, useState } from 'react';
import { USER_ROLE_LABELS } from '../constants/userRoles';
import {
  buildNewUserPayload,
  buildUserUpdates,
  createUserFormState,
  friendlyUserError,
} from '../helpers/userFormModel';
import UserFormField from './UserFormField';

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
    <div className="users-dialog-backdrop">
      <div className="users-dialog">
        <div className="users-dialog__header">
          <h2 className="users-dialog__title">{isNew ? 'Crear usuario' : 'Editar usuario'}</h2>
          <p className="users-dialog__copy">
            {isNew
              ? 'Crea una cuenta nueva y asigna su rol desde aquí.'
              : 'Actualiza el nombre visible o cambia el rol del usuario.'}
          </p>
        </div>

        <form onSubmit={submit} className="users-form">
          {isNew && (
            <UserFormField label="Correo electrónico" htmlFor="user-email">
              <input
                id="user-email"
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                className="app-control"
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
                className="app-control"
                placeholder="Ingresa una contraseña segura"
              />
            </UserFormField>
          )}

          <div className="users-form__grid">
            <UserFormField label="Nombre" htmlFor="user-display-name">
              <input
                id="user-display-name"
                type="text"
                value={form.displayName}
                onChange={set('displayName')}
                className="app-control"
                placeholder="Nombre completo"
              />
            </UserFormField>

            <UserFormField label="Rol" htmlFor="user-role">
              <select
                id="user-role"
                value={form.role}
                onChange={set('role')}
                className="app-control app-control--select"
              >
                {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </UserFormField>
          </div>

          {error && <p className="users-form__error">{error}</p>}

          <div className="users-form__actions">
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
