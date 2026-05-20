import { useCallback, useEffect, useState } from 'react';
import {
  createDomainPreset,
  deleteDomainPreset,
  listDomainPresets,
  updateDomainPreset,
} from '../services/domainPresetsService';

export default function useDomainPresets() {
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDomainPresets();
      setPresets(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(name, domains) {
    setSaving(true);
    try {
      const preset = await createDomainPreset(name, domains);
      setPresets(prev => [...prev, preset]);
      return preset;
    } finally {
      setSaving(false);
    }
  }

  async function update(id, name, domains) {
    setSaving(true);
    try {
      const preset = await updateDomainPreset(id, name, domains);
      setPresets(prev => prev.map(p => (p.id === id ? preset : p)));
      return preset;
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    setSaving(true);
    try {
      await deleteDomainPreset(id);
      setPresets(prev => prev.filter(p => p.id !== id));
    } finally {
      setSaving(false);
    }
  }

  return { presets, loading, error, saving, load, create, update, remove };
}
