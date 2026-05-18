export default function UserStatusBadge({ disabled }) {
  return (
    <span className={`user-badge ${disabled ? 'user-badge--danger' : 'user-badge--success'}`}>
      {disabled ? 'Deshabilitado' : 'Activo'}
    </span>
  );
}
