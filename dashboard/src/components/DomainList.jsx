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
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="moodle.universidad.edu"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm
            font-mono focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="button"
          onClick={add}
          className="bg-violet-700 hover:bg-violet-600 text-white text-sm px-3 py-2 rounded-lg transition-colors">
          Agregar
        </button>
      </div>

      {domains.length > 0 && (
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {domains.map(d => (
                <tr key={d} className="border-b border-gray-800 last:border-0">
                  <td className="px-3 py-2 font-mono text-violet-300">{d}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => remove(d)}
                      className="text-gray-500 hover:text-red-400 transition-colors text-xs">
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
        <p className="text-xs text-gray-600">Sin dominios — bloqueo total.</p>
      )}
    </div>
  );
}
