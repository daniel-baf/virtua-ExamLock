import { useState, useEffect } from 'react';

const ROLE_LABELS = { admin: 'Administrador', teacher: 'Profesor', student: 'Alumno' };

export default function UserForm({ user, onSave, onCancel }) {
  const isNew = !user;
  const [form, setForm] = useState({
    email: user?.email ?? '',
    password: '',
    displayName: user?.displayName ?? '',
    role: user?.role ?? 'teacher',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      email: user?.email ?? '',
      password: '',
      displayName: user?.displayName ?? '',
      role: user?.role ?? 'teacher',
    });
    setError('');
  }, [user]);

  function set(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isNew) {
        await onSave({ email: form.email, password: form.password, displayName: form.displayName, role: form.role });
      } else {
        const updates = { displayName: form.displayName, role: form.role };
        await onSave(user.uid, updates);
      }
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-[#0d0f12] p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold text-zinc-100">
          {isNew ? 'Crear usuario' : 'Editar usuario'}
        </h2>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {isNew && (
            <Field label="Correo electrónico">
              <input
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-sky-500 focus:outline-none"
                placeholder="usuario@ejemplo.com"
              />
            </Field>
          )}

          {isNew && (
            <Field label="Contraseña">
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={set('password')}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-sky-500 focus:outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </Field>
          )}

          <Field label="Nombre">
            <input
              type="text"
              value={form.displayName}
              onChange={set('displayName')}
              className="input"
              placeholder="Nombre completo"
            />
          </Field>

          <Field label="Rol">
            <select value={form.role} onChange={set('role')} className="input">
              {Object.entries(ROLE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </Field>

          {error && <p className="text-sm text-rose-400">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
