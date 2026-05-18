export const TAB_LABELS = { admitted: 'En curso', kicked: 'Cerrados' };

export const STATUS_META = {
  waiting:  { label: 'Esperando', dotClass: 'status-waiting' },
  admitted: { label: 'Activo', dotClass: 'status-admitted' },
  offline:  { label: 'Offline', dotClass: 'status-offline' },
  kicked:   { label: 'Expulsado', dotClass: 'status-kicked' },
  closed:   { label: 'Cerrado', dotClass: 'status-closed' },
};

export function fmtTime(ts) {
  if (!ts) return 'Sin registro';
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function closeReasonLabel(reason) {
  const map = {
    browser_closed: 'Cerro el navegador',
    submitted: 'Finalizo el examen',
    expelled: 'Expulsado por docente',
  };
  return map[reason] ?? reason;
}

export function liveStatusLabel(status) {
  const map = {
    connecting: 'Conectando stream',
    live: 'En vivo',
    ready: 'Esperando frames',
    error: 'Error de stream',
    offline: 'Alumno offline',
    stopped: 'Stream detenido',
  };
  return map[status] ?? 'Preparando stream';
}
