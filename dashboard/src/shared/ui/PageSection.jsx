import styles from './PageSection.module.css';

export default function PageSection({ actions, className = '', subtitle, title }) {
  return (
    <div className={[styles.section, className].filter(Boolean).join(' ')}>
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
