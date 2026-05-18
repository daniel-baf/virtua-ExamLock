import { api } from '@/shared/lib/api';

export function getMonitoringSettings() {
  return api.getMonitoringSettings();
}

export function updateMonitoringSettings(streamConfig) {
  return api.updateMonitoringSettings({ streamConfig });
}
