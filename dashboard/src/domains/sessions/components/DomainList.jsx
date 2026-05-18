import { useState } from 'react';
import {
  mergeDomainLists,
  normalizeDomain,
  normalizeDomainList,
  readLocalPresets,
  writeLocalPresets,
} from '../domainModel';
import styles from './DomainList.module.css';

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
    <div className={styles.root}>
      <div className={styles.tools}>
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
        <div className={styles.presetList}>
          {presets.map(preset => (
            <div key={preset.name} className={styles.presetPill}>
              <button type="button" onClick={() => loadPreset(preset.name)} className={styles.presetButton}>
                {preset.name}
              </button>
              <button type="button" onClick={() => deletePreset(preset.name)} aria-label={`Eliminar ${preset.name}`} className={styles.presetDelete}>
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={styles.row}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder="moodle.universidad.edu"
          className={styles.input}
        />
        <button
          type="button"
          onClick={add}
          className="btn link-btn">
          Agregar
        </button>
      </div>

      {entries.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.domain} className={styles.tableRow}>
                  <td>
                    <span className={`${styles.domainCell} ${!entry.enabled ? styles.domainCellDisabled : ''}`}>{entry.domain}</span>
                    {entry.source === 'default' && <span className={styles.source}>Default</span>}
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      type="button"
                      onClick={() => toggle(entry.domain)}
                      className={`${styles.status} ${entry.enabled ? styles.statusOn : styles.statusOff}`}>
                      {entry.enabled ? 'On' : 'Off'}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(entry.domain)}
                      className={styles.remove}>
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
        <p className={styles.empty}>Sin dominios - bloqueo total.</p>
      )}
    </div>
  );
}
