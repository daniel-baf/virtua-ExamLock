import { api } from '@/shared/lib/api';

export function getSessionAudit(sessionId) {
  return api.getAudit(sessionId);
}
