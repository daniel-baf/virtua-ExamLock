import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function Results() {
  const { id: sessionId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getResults(sessionId)
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen msg={error} />;

  const { students, answers, questions } = data;

  // Map answers: studentId → questionId → answer
  const answerMap = {};
  answers.forEach(a => {
    if (!answerMap[a.studentId]) answerMap[a.studentId] = {};
    answerMap[a.studentId][a.questionId] = a.answer;
  });

  function exportCSV() {
    const header = ['Alumno', 'Estado', ...questions.map((_, i) => `P${i + 1}`)];
    const rows = students.map(s => [
      s.name ?? s.id,
      s.status,
      ...questions.map(q => answerMap[s.id]?.[q.id] ?? '—'),
    ]);
    const csv = [header, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `resultados-${sessionId}.csv`;
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white text-sm transition-colors">← Volver</Link>
          <span className="font-semibold">Resultados</span>
        </div>
        <button onClick={exportCSV}
          className="text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700
            px-4 py-2 rounded-lg transition-colors">
          Exportar CSV
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Alumnos" value={students.length} />
          <StatCard label="Respondieron" value={new Set(answers.map(a => a.studentId)).size} />
          <StatCard label="Preguntas" value={questions.length} />
        </div>

        {/* Results table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Alumno</th>
                  <th className="text-left px-4 py-3 text-gray-400 font-medium">Estado</th>
                  {questions.map((q, i) => (
                    <th key={q.id} className="text-left px-4 py-3 text-gray-400 font-medium min-w-24">
                      P{i + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium">{s.name ?? s.id.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    {questions.map(q => {
                      const answer = answerMap[s.id]?.[q.id];
                      const correct = q.correctAnswer;
                      const isCorrect = correct && answer === correct;
                      const isWrong = correct && answer && answer !== correct;
                      return (
                        <td key={q.id} className="px-4 py-3">
                          <span className={`${isCorrect ? 'text-green-400' : isWrong ? 'text-red-400' : 'text-gray-300'}`}>
                            {answer ?? <span className="text-gray-600">—</span>}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Question legend */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-medium mb-3 text-gray-200">Preguntas</h3>
          <ol className="space-y-2">
            {questions.map((q, i) => (
              <li key={q.id} className="text-sm text-gray-300">
                <span className="text-gray-500 mr-2">P{i + 1}.</span>
                {q.text}
                {q.correctAnswer && (
                  <span className="ml-2 text-green-400 text-xs">→ {q.correctAnswer}</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = { active: 'text-green-400', offline: 'text-yellow-400', closed: 'text-red-400' };
  return <span className={`${colors[status] ?? 'text-gray-400'} capitalize`}>{status}</span>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
      Cargando resultados…
    </div>
  );
}

function ErrorScreen({ msg }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">
      Error: {msg}
    </div>
  );
}
