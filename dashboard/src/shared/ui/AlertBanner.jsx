import styles from './AlertBanner.module.css';

const TONE_CLASS = {
  error: styles.error,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
};

export default function AlertBanner({ children, className = '', tone = 'error' }) {
  return (
    <div className={[styles.banner, TONE_CLASS[tone] ?? styles.error, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
