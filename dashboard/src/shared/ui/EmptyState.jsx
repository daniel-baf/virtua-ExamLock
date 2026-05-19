import styles from './EmptyState.module.css';

export default function EmptyState({ className = '', description, title }) {
  return (
    <div className={[styles.state, className].filter(Boolean).join(' ')}>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
    </div>
  );
}
