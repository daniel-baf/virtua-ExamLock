import styles from '@users/styles/Users.module.css';

export default function UserStatusBadge({ disabled }) {
  return (
    <span className={`${styles.badge} ${disabled ? styles.badgeDanger : styles.badgeSuccess}`}>
      {disabled ? 'Deshabilitado' : 'Activo'}
    </span>
  );
}
