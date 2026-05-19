import CardPanel from '@shared/ui/CardPanel';
import styles from './AuditTotals.module.css';

const TOTALS = [
  ['Registrados', 'registered', 'neutral'],
  ['Admitidos', 'admitted', 'ok'],
  ['Expulsados', 'kicked', 'danger'],
  ['Conectados al cerrar', 'currentlyConnected', 'warning'],
];

export default function AuditTotals({ totals }) {
  return (
    <div className={styles.totals}>
      {TOTALS.map(([label, key, tone]) => (
        <CardPanel key={key} className={styles.total}>
          <p className={`${styles.value} ${styles[tone]}`}>{totals[key]}</p>
          <p className={styles.label}>{label}</p>
        </CardPanel>
      ))}
    </div>
  );
}
