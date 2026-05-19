import styles from '@users/styles/Users.module.css';

export default function UserFormField({ label, htmlFor, children, hint }) {
  return (
    <label className={styles.field} htmlFor={htmlFor}>
      <span className={styles.fieldLabel}>{label}</span>
      {children}
      {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
    </label>
  );
}
