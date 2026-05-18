export const EVENT_LABEL = {
  join: 'Ingresó',
  reconnected: 'Se reconectó',
  admit: 'Admitido',
  kick: 'Expulsado',
  readmit: 'Readmitido',
  offline: 'Se desconectó',
  closed: 'Cerró sesión',
  'screenshot-requested': 'Captura solicitada',
  'screenshot-all-requested': 'Captura grupal solicitada',
  'screenshot-received': 'Captura recibida',
  'screenshot-error': 'Error de captura',
  'stream-ready': 'Stream preparado',
  'stream-started': 'Stream iniciado',
  'stream-stopped': 'Stream detenido',
  'stream-error': 'Error de stream',
  'message-sent': 'Mensaje enviado',
  'whitelist-applied': 'Whitelist actualizada',
  'exam-ended': 'Examen terminado',
};

export function fmtAuditTime(ts) {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatAuditEventDetail(event) {
  const payload = event.payload ?? {};

  if (event.type === 'offline' && payload.offlineAt) {
    return `Offline desde ${fmtAuditTime(payload.offlineAt)}`;
  }

  if (event.type === 'reconnected') {
    return [
      payload.attempt ? `Reingreso #${payload.attempt}` : null,
      payload.email ?? null,
    ].filter(Boolean).join(' · ');
  }

  if (event.type === 'readmit') {
    return payload.attempt ? `Intento total: ${payload.attempt}` : '';
  }

  if (event.type === 'kick') {
    return payload.reason ? `Motivo: ${payload.reason}` : '';
  }

  if (event.type === 'closed') {
    return payload.reason ? `Motivo: ${payload.reason}` : '';
  }

  if (event.type === 'message-sent') {
    return payload.text ? `"${payload.text}"` : '';
  }

  if (event.type === 'screenshot-requested') {
    return payload.requestId ? `Solicitud ${payload.requestId}` : '';
  }

  if (event.type === 'screenshot-all-requested') {
    return [
      Number.isFinite(payload.requested) ? `${payload.requested} solicitadas` : null,
      Number.isFinite(payload.skipped) ? `${payload.skipped} omitidas` : null,
    ].filter(Boolean).join(' · ');
  }

  if (event.type === 'screenshot-error' || event.type === 'stream-error') {
    return payload.error ?? '';
  }

  if (event.type === 'whitelist-applied') {
    const domains = Array.isArray(payload.domains) ? payload.domains : [];
    return payload.blockInternet
      ? `${domains.length} dominio(s) permitidos`
      : 'Internet libre';
  }

  if (event.type === 'stream-ready' && payload.streamReadyAt) {
    return `A las ${fmtAuditTime(payload.streamReadyAt)}`;
  }

  if (event.type === 'stream-started' && payload.startedAt) {
    return `A las ${fmtAuditTime(payload.startedAt)}`;
  }

  if (event.type === 'stream-stopped' && payload.stoppedAt) {
    return `A las ${fmtAuditTime(payload.stoppedAt)}`;
  }

  return '';
}
