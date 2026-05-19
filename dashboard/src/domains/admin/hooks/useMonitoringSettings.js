import { useCallback, useEffect, useState } from 'react';
import { getMonitoringSettings, updateMonitoringSettings } from '../services/monitoringSettingsService';

export default function useMonitoringSettings() {
  const [streamConfig, setStreamConfig] = useState({ resolutionPreset: '720p', intervalMs: 2000 });
  const [presets, setPresets] = useState({ resolutionPreset: [], intervalMs: [] });
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMonitoringSettings();
      setStreamConfig(data.streamConfig);
      setPresets(data.presets);
      setUpdatedAt(data.updatedAt);
    } catch (err) {
      setError(err.message ?? 'No se pudo cargar la configuración.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    setSaving(true);
    setError('');
    try {
      const saved = await updateMonitoringSettings(streamConfig);
      setStreamConfig(saved.streamConfig);
      setUpdatedAt(saved.updatedAt);
    } catch (err) {
      setError(err.message ?? 'No se pudo guardar la configuración.');
    } finally {
      setSaving(false);
    }
  }

  return {
    streamConfig,
    presets,
    updatedAt,
    loading,
    saving,
    error,
    setStreamConfig,
    refresh: load,
    save,
  };
}
