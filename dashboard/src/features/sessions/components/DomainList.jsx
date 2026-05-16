import { useState } from 'react';
import './DomainList.css';
import {
  mergeDomainLists,
  normalizeDomain,
  normalizeDomainList,
  readLocalPresets,
  writeLocalPresets,
} from '../domainModel';

export default function DomainList({ domains, onChange, onLoadDefault, defaultLoading = false }) {
  const [draft, setDraft] = useState('');
  const [presets, setPresets] = useState(() => readLocalPresets());
  const entries = normalizeDomainList(domains);

  function add() {
    const v = normalizeDomain(draft);
    if (!v) return;
    if (entries.some(entry => entry.domain === v)) { setDraft(''); return; }
    onChange([...entries, { domain: v, enabled: true, source: 'custom' }]);
    setDraft('');
  }

  function remove(domain) {
    onChange(entries.filter(entry => entry.domain !== domain));
  }

  function toggle(domain) {
    onChange(entries.map(entry => (
      entry.domain === domain ? { ...entry, enabled: !entry.enabled } : entry
    )));
  }

  function onKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); add(); }
  }

  function savePreset() {
    if (entries.length === 0) return;
    const name = prompt('Nombre de la lista');
    const cleanName = String(name ?? '').trim();
    if (!cleanName) return;

    const next = writeLocalPresets([
      ...presets.filter(preset => preset.name.toLowerCase() !== cleanName.toLowerCase()),
      { name: cleanName, domains: entries },
    ]);
    setPresets(next);
  }

  function loadPreset(name) {
    const preset = presets.find(item => item.name === name);
    if (!preset) return;
    onChange(mergeDomainLists(entries, preset.domains));
  }

  function deletePreset(name) {
    const next = writeLocalPresets(presets.filter(preset => preset.name !== name));
    setPresets(next);
  }

  return (
    <div className="domain-list">
      <div className="domain-tools">
        {onLoadDefault && (
          <button type="button" onClick={onLoadDefault} disabled={defaultLoading} className="link-btn">
            {defaultLoading ? 'Cargando...' : 'Cargar config default'}
          </button>
        )}
        <button type="button" onClick={savePreset} disabled={entries.length === 0} className="link-btn">
          Guardar lista
        </button>
      </div>

      {presets.length > 0 && (
        <div className="preset-list">
          {presets.map(preset => (
            <div key={preset.name} className="preset-pill">
              <button type="button" onClick={() => loadPreset(preset.name)}>
                {preset.name}
              </button>
              <button type="button" onClick={() => deletePreset(preset.name)} aria-label={`Eliminar ${preset.name}`}>
                x
              </button>
            </div>
          ))}
        </div>
      )}

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

      {entries.length > 0 && (
        <div className="domain-table">
          <table className="w-full text-sm">
            <tbody>
              {entries.map(entry => (
                <tr key={entry.domain} className={entry.enabled ? '' : 'domain-row--disabled'}>
                  <td>
                    <span>{entry.domain}</span>
                    {entry.source === 'default' && <span className="domain-source">Default</span>}
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggle(entry.domain)}
                      className={`domain-status ${entry.enabled ? 'domain-status--on' : 'domain-status--off'}`}>
                      {entry.enabled ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(entry.domain)}
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

      {entries.length === 0 && (
        <p className="domain-empty">Sin dominios - bloqueo total.</p>
      )}
    </div>
  );
}
