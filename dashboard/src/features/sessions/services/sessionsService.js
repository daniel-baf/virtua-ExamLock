import { api } from '@/shared/lib/api';

export function listSessions() {
  return api.listSessions();
}

export function createSession(payload) {
  return api.createSession(payload);
}

export function resetSessionsData() {
  return api.resetDb();
}
