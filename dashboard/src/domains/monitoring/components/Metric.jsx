export default function Metric({ label, value, tone = 'zinc' }) {
  return (
    <div className="metric">
      <span className={`metric__value metric__value--${tone}`}>{value}</span>
      <span className="metric__label">{label}</span>
    </div>
  );
}
