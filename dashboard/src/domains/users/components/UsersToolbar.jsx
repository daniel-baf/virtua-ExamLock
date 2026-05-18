import styles from '@users/styles/Users.module.css';

export default function UsersToolbar({ onCreate }) {
  return (
    <div className={styles.sectionTitle}>
      <div>
        <h2>Usuarios</h2>
        <p className={styles.sectionCopy}>Gestiona cuentas de administrador, profesor y alumno.</p>
      </div>
      <button type="button" onClick={onCreate} className="btn btn-primary">
        Crear usuario
      </button>
    </div>
  );
}
