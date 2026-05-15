import { useState } from 'react';

export default function DomainList({ domains, onChange }) {
  const [draft, setDraft] = useState('');

  function add() {
    const v = draft.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!v) return;
    if (domains.includes(v)) { setDraft(''); return; }
    onChange([...domains, v]);
    setDraft('');
  }

  function remove(d) {
    onChange(domains.filter(x => x !== d));
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  }

  return (
    <div className="domain-list">
      <div className="domain-row">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="moodle.universidad.edu"
          className="domain-input"
        />
        <button
          type="button"
          onClick={add}
          className="btn link-btn">
          Agregar
        </button>
      </div>

      {domains.length > 0 && (
        <div className="domain-table">
          <table className="w-full text-sm">
            <tbody>
              {domains.map(d => (
                <tr key={d}>
                  <td>{d}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => remove(d)}
                      className="remove-btn">
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {domains.length === 0 && (
        <p className="domain-empty">Sin dominios - bloqueo total.</p>
      )}
    </div>
  );
}
