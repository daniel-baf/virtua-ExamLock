export default function UsersToolbar({ onCreate }) {
  return (
    <div className="section-title">
      <div>
        <h2>Usuarios</h2>
        <p className="users-section-copy">Gestiona cuentas de administrador, profesor y alumno.</p>
      </div>
      <button type="button" onClick={onCreate} className="btn btn-primary">
        Crear usuario
      </button>
    </div>
  );
}
