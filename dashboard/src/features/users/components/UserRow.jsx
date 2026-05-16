import { useState } from 'react';

const ROLE_LABELS = { admin: 'Admin', teacher: 'Profesor', student: 'Alumno' };
const ROLE_COLORS = {
  admin:   'text-amber-400 bg-amber-400/10',
  teacher: 'text-sky-400 bg-sky-400/10',
  student: 'text-emerald-400 bg-emerald-400/10',
};

export default function UserRow({ user, onEdit, onDelete, onToggleDisabled }) {
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    onDelete(user.uid);
  }

  return (
    <tr className="border-b border-zinc-800 hover:bg-zinc-900/40">
      <td className="py-3 pr-4 text-sm text-zinc-200">{user.email}</td>
      <td className="py-3 pr-4 text-sm text-zinc-400">{user.displayName || '—'}</td>
      <td className="py-3 pr-4">
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role] ?? 'text-zinc-400 bg-zinc-800'}`}>
          {ROLE_LABELS[user.role] ?? user.role ?? '—'}
        </span>
      </td>
      <td className="py-3 pr-4">
        {user.disabled
          ? <span className="text-xs text-rose-400">Deshabilitado</span>
          : <span className="text-xs text-emerald-400">Activo</span>}
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(user)} className="btn btn-ghost text-xs">
            Editar
          </button>
          <button
            onClick={() => onToggleDisabled(user.uid, !user.disabled)}
            className="btn btn-ghost text-xs"
          >
            {user.disabled ? 'Habilitar' : 'Deshabilitar'}
          </button>
          <button
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
            className={`btn text-xs ${confirming ? 'btn-danger' : 'btn-ghost text-rose-400 hover:text-rose-300'}`}
          >
            {confirming ? '¿Confirmar?' : 'Eliminar'}
          </button>
        </div>
      </td>
    </tr>
  );
}
