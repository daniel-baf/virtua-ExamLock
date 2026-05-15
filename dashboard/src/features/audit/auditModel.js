export const EVENT_LABEL = {
  join: 'Ingresó',
  admit: 'Admitido',
  kick: 'Expulsado',
  readmit: 'Readmitido',
  offline: 'Se desconectó',
  closed: 'Cerró sesión',
  'screenshot-requested': 'Captura solicitada',
  'screenshot-all-requested': 'Captura grupal solicitada',
  'screenshot-received': 'Captura recibida',
  'screenshot-error': 'Error de captura',
  'whitelist-applied': 'Whitelist actualizada',
  message: 'Mensaje enviado',
  'exam-ended': 'Examen terminado',
};

export function fmtAuditTime(ts) {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
