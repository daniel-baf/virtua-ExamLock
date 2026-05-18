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

export function statusSummaryLabel(student) {
  if (student.status === 'offline') return 'Offline';
  if (student.status === 'waiting') return 'Esperando ingreso';
  if (student.status === 'closed') return 'Cerrado';
  if (student.status === 'kicked') return 'Expulsado';
  return 'Activo';
}

export function hasStudentAttention(student) {
  return Boolean(
    student.status === 'offline'
    || student.status === 'closed'
    || student.screenshotError
    || student.streamError,
  );
}

export function matchesStudentFilter(student, filter) {
  if (!filter || filter === 'all') return true;
  if (filter === 'attention') return hasStudentAttention(student);
  if (filter === 'offline') return student.status === 'offline';
  if (filter === 'closed') return student.status === 'closed' || student.status === 'kicked';
  if (filter === 'stream') return student.streamStatus === 'live' || student.streamReady;
  return true;
}

export function matchesStudentSearch(student, search) {
  if (!search.trim()) return true;
  const needle = search.trim().toLowerCase();
  const haystack = [
    student.name,
    student.email,
    student.uid,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(needle);
}
