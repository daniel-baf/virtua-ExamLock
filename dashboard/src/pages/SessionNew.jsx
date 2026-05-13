import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function SessionNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [timeLimit, setTimeLimit] = useState(90);
  const [domainsText, setDomainsText] = useState('');
  const [blockInternet, setBlockInternet] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio.');
    setError('');
    setSaving(true);
    try {
      const domains = domainsText
        .split('\n')
        .map(d => d.trim().toLowerCase())
        .filter(Boolean);
      await api.createSession({ name, timeLimit, whitelist: domains, blockInternet });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center gap-4">
        <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors text-sm">← Volver</Link>
        <span className="font-semibold">Nueva sesión</span>
      </header>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Metadata */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-gray-200">Configuración</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Nombre de la sesión</label>
            <input value={name} onChange={e => setName(e.target.value)} required
              placeholder="Ej: Cálculo I — Sección B"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Tiempo límite (minutos)</label>
            <input type="number" min={5} max={300} value={timeLimit}
              onChange={e => setTimeLimit(Number(e.target.value))}
              className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm
                focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
        </div>

        {/* Network control */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-200">Control de internet</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-sm text-gray-400">{blockInternet ? 'Restringido' : 'Libre'}</span>
              <div className="relative">
                <input type="checkbox" checked={blockInternet} onChange={e => setBlockInternet(e.target.checked)}
                  className="sr-only" />
                <div onClick={() => setBlockInternet(v => !v)}
                  className={`w-10 h-5 rounded-full cursor-pointer transition-colors
                    ${blockInternet ? 'bg-violet-600' : 'bg-gray-700'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform
                    ${blockInternet ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
              </div>
            </label>
          </div>

          {blockInternet && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">
                Dominios permitidos (uno por línea)
              </label>
              <textarea value={domainsText} onChange={e => setDomainsText(e.target.value)}
                rows={5} placeholder={'moodle.universidad.edu\ngoogle.com\nstackoverflow.com'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm
                  font-mono resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <p className="text-xs text-gray-500 mt-1">
                DNS + localhost siempre permitidos. Vacío = bloqueo total.
              </p>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium
            rounded-lg py-3 text-sm transition-colors">
          {saving ? 'Creando sesión…' : 'Crear sesión'}
        </button>
      </form>
    </div>
  );
}
