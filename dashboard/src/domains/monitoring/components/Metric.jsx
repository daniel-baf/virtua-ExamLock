import styles from '@monitoring/components/Metric.module.css';

export default function Metric({ label, value, tone = 'zinc' }) {
  return (
    <div className={styles.metric}>
      <span className={`${styles.value} ${styles[tone] ?? ''}`}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
