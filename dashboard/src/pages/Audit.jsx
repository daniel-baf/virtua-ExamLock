import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import AuthImage from '../components/AuthImage';

const EVENT_LABEL = {
  join:                   'Ingresó',
  admit:                  'Admitido',
  kick:                   'Expulsado',
  readmit:                'Readmitido',
  offline:                'Se desconectó',
  closed:                 'Cerró sesión',
  'screenshot-requested': 'Captura solicitada',
  'screenshot-all-requested': 'Captura grupal solicitada',
  'screenshot-received':  'Captura recibida',
  'screenshot-error':     'Error de captura',
  'whitelist-applied':    'Whitelist actualizada',
  message:                'Mensaje enviado',
  'exam-ended':           'Examen terminado',
};

function fmt(ts) {
  return new Date(ts).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function Audit() {
  const { id: sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    api.getAudit(sessionId)
      .then(setData)
      .catch(err => setError(err.message));
  }, [sessionId]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { session, totals, students } = data;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm">← Volver</Link>
        <span className="font-semibold">Auditoría — {session.name}</span>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Registrados', value: totals.registered, color: 'text-gray-300' },
            { label: 'Admitidos', value: totals.admitted, color: 'text-green-400' },
            { label: 'Expulsados', value: totals.kicked, color: 'text-red-400' },
            { label: 'Conectados al cerrar', value: totals.currentlyConnected, color: 'text-yellow-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Per-student */}
        <div className="space-y-3">
          {students.map(s => {
            const isExpanded = expanded[s.uid];
            const readmitCount = s.attempts ?? 0;
            return (
              <div key={s.uid} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                {/* Row */}
                <button
                  className="w-full px-5 py-3 flex items-center gap-4 text-left hover:bg-gray-800/50 transition-colors"
                  onClick={() => setExpanded(prev => ({ ...prev, [s.uid]: !isExpanded }))}>
                  <div className={`w-2 h-2 rounded-full shrink-0
                    ${s.status === 'admitted' ? 'bg-green-500'
                    : s.status === 'kicked' ? 'bg-red-500'
                    : 'bg-gray-500'}`} />
                  <span className="flex-1 text-sm font-medium">{s.email ?? s.uid}</span>
                  {readmitCount > 0 && (
                    <span className="text-xs text-yellow-400 bg-yellow-900/40 px-2 py-0.5 rounded-full">
                      {readmitCount} reingreso{readmitCount > 1 ? 's' : ''}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">{s.screenshots?.length ?? 0} capturas</span>
                  <span className="text-gray-600 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-800 px-5 py-4 space-y-4">
                    {/* Timeline */}
                    {s.timeline?.length > 0 && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Timeline</h4>
                        <div className="space-y-1">
                          {s.timeline.map((ev, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                              <span className="text-gray-600 shrink-0 font-mono text-xs w-20">{fmt(ev.ts)}</span>
                              <span className="text-gray-300">{EVENT_LABEL[ev.type] ?? ev.type}</span>
                              {ev.payload?.reason && (
                                <span className="text-gray-500 text-xs">({ev.payload.reason})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Screenshots gallery */}
                    {s.screenshots?.length > 0 && (
                      <div>
                        <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                          Capturas ({s.screenshots.length})
                        </h4>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {s.screenshots.map((sc, i) => (
                            <div key={i}>
                              <AuthImage uid={s.uid} src={sc.url} alt={`captura ${i + 1}`}
                                className="grid w-full aspect-video place-items-center object-cover rounded border border-gray-700
                                  hover:border-violet-500 transition-colors text-xs text-gray-600" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
