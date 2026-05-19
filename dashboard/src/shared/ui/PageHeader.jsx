import Button from './Button';
import styles from './PageHeader.module.css';

export default function PageHeader({
  actions,
  backLabel = 'Volver',
  backTo,
  brandSubtitle,
  brandTitle,
  className = '',
  narrow = false,
  subtitle,
  title,
}) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')}>
      <div className={[styles.inner, narrow ? styles.narrow : ''].filter(Boolean).join(' ')}>
        <div className={styles.lead}>
          {backTo && (
            <Button to={backTo} variant="link" className={styles.backButton}>
              {backLabel}
            </Button>
          )}

          {brandTitle && (
            <div className={styles.brand}>
              <div className={styles.brandMark} aria-hidden="true" />
              <div>
                <p className={styles.brandTitle}>{brandTitle}</p>
                {brandSubtitle && <p className={styles.brandSubtitle}>{brandSubtitle}</p>}
              </div>
            </div>
          )}

          {(title || subtitle) && (
            <div className={styles.copy}>
              {title && <p className={styles.title}>{title}</p>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          )}
        </div>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
