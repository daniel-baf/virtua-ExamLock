import { api } from '@/shared/lib/api';

export function listDomainPresets() {
  return api.adminListDomainPresets();
}

export function createDomainPreset(name, domains) {
  return api.createDomainPreset({ name, domains });
}

export function updateDomainPreset(id, name, domains) {
  return api.updateDomainPreset(id, { name, domains });
}

export function deleteDomainPreset(id) {
  return api.deleteDomainPreset(id);
}
