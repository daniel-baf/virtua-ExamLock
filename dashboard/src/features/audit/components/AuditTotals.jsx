const TOTALS = [
  ['Registrados', 'registered', 'neutral'],
  ['Admitidos', 'admitted', 'ok'],
  ['Expulsados', 'kicked', 'danger'],
  ['Conectados al cerrar', 'currentlyConnected', 'warning'],
];

export default function AuditTotals({ totals }) {
  return (
    <div className="audit-totals">
      {TOTALS.map(([label, key, tone]) => (
        <div key={key} className="audit-total">
          <p className={`audit-total__value audit-total--${tone}`}>{totals[key]}</p>
          <p className="audit-total__label">{label}</p>
        </div>
      ))}
    </div>
  );
}
