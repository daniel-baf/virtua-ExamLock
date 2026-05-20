import { useState } from 'react';
import { AdminHeader } from '@admin';
import useDomainPresets from '@admin/hooks/useDomainPresets';
import DomainList from '@sessions/components/DomainList';
import { normalizeDomainList } from '@sessions/domainModel';
import { AlertBanner, Button, CardPanel, LoadingState, PageSection } from '@shared/ui';
import styles from './DomainPresetsPage.module.css';

const EMPTY_EDITOR = { id: null, name: '', domains: [] };

export default function DomainPresetsPage() {
  const presets = useDomainPresets();
  const [editor, setEditor] = useState(null);
  const [editorError, setEditorError] = useState(null);

  function openNew() {
    setEditor({ ...EMPTY_EDITOR });
    setEditorError(null);
  }

  function openEdit(preset) {
    setEditor({ id: preset.id, name: preset.name, domains: preset.domains });
    setEditorError(null);
  }

  function cancelEditor() {
    setEditor(null);
    setEditorError(null);
  }

  async function saveEditor() {
    if (!editor.name.trim()) { setEditorError('El nombre es requerido.'); return; }
    if (normalizeDomainList(editor.domains).length === 0) { setEditorError('Agregá al menos un dominio.'); return; }
    setEditorError(null);
    try {
      if (editor.id) {
        await presets.update(editor.id, editor.name, editor.domains);
      } else {
        await presets.create(editor.name, editor.domains);
      }
      setEditor(null);
    } catch (e) {
      setEditorError(e.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta lista?')) return;
    try {
      await presets.remove(id);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  return (
    <div className={styles.pageShell}>
      <AdminHeader activeSection="domain-presets" loading={presets.loading} onRefresh={presets.load} />

      <main className={styles.content}>
        <PageSection
          title="Listas de dominios"
          subtitle="Listas globales disponibles para todos los docentes al crear o gestionar sesiones."
          actions={!editor && <Button variant="primary" onClick={openNew}>+ Nueva lista</Button>}
        />

        {presets.error && <AlertBanner>{presets.error}</AlertBanner>}

        {editor && !editor.id && (
          <CardPanel className={styles.editorCard}>
            <p className={styles.editorTitle}>Nueva lista</p>
            <EditorForm
              editor={editor}
              onChange={setEditor}
              onSave={saveEditor}
              onCancel={cancelEditor}
              saving={presets.saving}
              error={editorError}
            />
          </CardPanel>
        )}

        {presets.loading ? (
          <LoadingState label="Cargando listas..." />
        ) : (
          <div className={styles.presetList}>
            {presets.presets.map(preset => (
              <CardPanel key={preset.id} className={styles.presetCard}>
                {editor?.id === preset.id ? (
                  <>
                    <p className={styles.editorTitle}>Editar lista</p>
                    <EditorForm
                      editor={editor}
                      onChange={setEditor}
                      onSave={saveEditor}
                      onCancel={cancelEditor}
                      saving={presets.saving}
                      error={editorError}
                    />
                  </>
                ) : (
                  <>
                    <div className={styles.presetHeader}>
                      <span className={styles.presetName}>{preset.name}</span>
                      {preset.builtin && <span className={styles.builtinBadge}>Predefinida</span>}
                    </div>
                    <div className={styles.domainPills}>
                      {normalizeDomainList(preset.domains).map(entry => (
                        <span
                          key={entry.domain}
                          className={`${styles.domainPill} ${!entry.enabled ? styles.domainPillOff : ''}`}
                        >
                          {entry.domain}
                        </span>
                      ))}
                    </div>
                    <div className={styles.cardActions}>
                      {!preset.builtin && (
                        <>
                          <Button variant="ghost" onClick={() => openEdit(preset)}>Editar</Button>
                          <Button variant="danger" onClick={() => handleDelete(preset.id)} disabled={presets.saving}>
                            Eliminar
                          </Button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </CardPanel>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function EditorForm({ editor, onChange, onSave, onCancel, saving, error }) {
  return (
    <>
      <div className={styles.nameField}>
        <label>Nombre de la lista</label>
        <input
          className={styles.nameInput}
          value={editor.name}
          onChange={e => onChange(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ej: Python, JavaScript, Moodle..."
        />
      </div>
      <DomainList
        domains={editor.domains}
        onChange={domains => onChange(prev => ({ ...prev, domains }))}
      />
      {error && <AlertBanner>{error}</AlertBanner>}
      <div className={styles.editorActions}>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button variant="primary" onClick={onSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </>
  );
}
