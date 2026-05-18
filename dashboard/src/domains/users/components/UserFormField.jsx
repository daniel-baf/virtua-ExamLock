export default function UserFormField({ label, htmlFor, children, hint }) {
  return (
    <label className="app-field" htmlFor={htmlFor}>
      <span className="app-field__label">{label}</span>
      {children}
      {hint ? <span className="app-field__hint">{hint}</span> : null}
    </label>
  );
}
