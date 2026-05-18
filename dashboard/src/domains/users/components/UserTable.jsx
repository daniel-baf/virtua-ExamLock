import UserRow from './UserRow';

export default function UserTable({ users, onEdit, onDelete, onToggleDisabled }) {
  return (
    <section className="users-table-card">
      <div className="users-table-scroll">
        <table className="users-table">
          <thead>
            <tr>
              <th>Correo</th>
              <th>Nombre</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <UserRow
                key={user.uid}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleDisabled={onToggleDisabled}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
