import UserRow from '@users/components/UserRow';
import styles from '@users/styles/Users.module.css';

export default function UserTable({ users, onEdit, onDelete, onToggleDisabled }) {
  return (
    <section className={styles.tableCard}>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
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
