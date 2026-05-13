import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { saveSessions } from './Dashboard';

const QUESTION_TYPES = [
  { value: 'multiple_choice', label: 'Opción múltiple' },
  { value: 'true_false', label: 'Verdadero / Falso' },
  { value: 'free_text', label: 'Texto libre' },
  { value: 'code', label: 'Código' },
];

function blankQuestion(order) {
  return { _id: crypto.randomUUID(), order, type: 'multiple_choice', text: '', options: ['', '', '', ''], correctAnswer: '' };
}

export default function SessionNew() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [timeLimit, setTimeLimit] = useState(90);
  const [questions, setQuestions] = useState([blankQuestion(0)]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addQuestion() {
    setQuestions(qs => [...qs, blankQuestion(qs.length)]);
  }

  function removeQuestion(idx) {
    setQuestions(qs => qs.filter((_, i) => i !== idx).map((q, i) => ({ ...q, order: i })));
  }

  function updateQuestion(idx, patch) {
    setQuestions(qs => qs.map((q, i) => i === idx ? { ...q, ...patch } : q));
  }

  function updateOption(qIdx, oIdx, value) {
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[oIdx] = value;
      return { ...q, options };
    }));
  }

  function importCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split('\n').filter(Boolean);
      const parsed = lines.map((line, i) => {
        const [text, opt1, opt2, opt3, opt4, correct] = line.split(';');
        return {
          _id: crypto.randomUUID(), order: i, type: 'multiple_choice',
          text: text?.trim() ?? '',
          options: [opt1, opt2, opt3, opt4].map(o => o?.trim() ?? ''),
          correctAnswer: correct?.trim() ?? '',
        };
      });
      setQuestions(parsed);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio.');
    if (questions.some(q => !q.text.trim())) return setError('Todas las preguntas necesitan texto.');
    setError('');
    setSaving(true);
    try {
      const { sessionId, code } = await api.createSession({ name, timeLimit });
      await api.createQuestions(sessionId, questions.map(({ _id, ...q }) => q));

      const stored = JSON.parse(localStorage.getItem('examlock:sessions') ?? '[]');
      saveSessions([...stored, { sessionId, code, name, createdAt: Date.now() }]);

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

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-6 py-8 space-y-6">
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

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-200">Preguntas ({questions.length})</h3>
            <label className="text-sm text-gray-400 hover:text-white cursor-pointer transition-colors">
              Importar CSV
              <input type="file" accept=".csv" className="hidden" onChange={importCSV} />
            </label>
          </div>

          {questions.map((q, idx) => (
            <QuestionCard key={q._id} q={q} idx={idx}
              onChange={patch => updateQuestion(idx, patch)}
              onOptionChange={(oIdx, val) => updateOption(idx, oIdx, val)}
              onRemove={() => removeQuestion(idx)}
              canRemove={questions.length > 1} />
          ))}

          <button type="button" onClick={addQuestion}
            className="w-full border border-dashed border-gray-700 hover:border-violet-500 text-gray-400
              hover:text-violet-400 rounded-xl py-3 text-sm transition-colors">
            + Agregar pregunta
          </button>
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

function QuestionCard({ q, idx, onChange, onOptionChange, onRemove, canRemove }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs text-gray-500 mt-1">#{idx + 1}</span>
        <div className="flex-1 space-y-3">
          <select value={q.type} onChange={e => onChange({ type: e.target.value, options: q.options })}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm
              focus:outline-none focus:ring-2 focus:ring-violet-500">
            {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <textarea value={q.text} onChange={e => onChange({ text: e.target.value })} required
            rows={2} placeholder="Texto de la pregunta…"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm
              resize-none focus:outline-none focus:ring-2 focus:ring-violet-500" />

          {q.type === 'multiple_choice' && (
            <div className="space-y-2">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${q._id}`} value={opt}
                    checked={q.correctAnswer === opt} onChange={() => onChange({ correctAnswer: opt })}
                    className="accent-violet-500" />
                  <input value={opt} onChange={e => onOptionChange(oIdx, e.target.value)}
                    placeholder={`Opción ${oIdx + 1}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm
                      focus:outline-none focus:ring-2 focus:ring-violet-500" />
                </div>
              ))}
              <p className="text-xs text-gray-500">Selecciona el radio de la respuesta correcta.</p>
            </div>
          )}

          {q.type === 'true_false' && (
            <div className="flex gap-4">
              {['Verdadero', 'Falso'].map(v => (
                <label key={v} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="radio" name={`tf-${q._id}`} value={v}
                    checked={q.correctAnswer === v} onChange={() => onChange({ correctAnswer: v })}
                    className="accent-violet-500" />
                  {v}
                </label>
              ))}
            </div>
          )}
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove}
            className="text-gray-600 hover:text-red-400 transition-colors mt-1">
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
