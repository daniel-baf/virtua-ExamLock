import styles from './LoadingState.module.css';

export default function LoadingState({ className = '', label = 'Cargando…' }) {
  return (
    <div className={[styles.state, className].filter(Boolean).join(' ')}>
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.label}>{label}</p>
    </div>
  );
}
