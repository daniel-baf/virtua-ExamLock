import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#090a0c] text-zinc-100">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-1 lg:grid-cols-[1fr_420px]">
        <section className="hidden border-r border-zinc-900 px-10 py-10 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-950">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide">ExamLock</span>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-xs uppercase tracking-[0.25em] text-zinc-600">Panel docente</p>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white">
              Supervision clara para laboratorios en vivo.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-zinc-500">
              Control de red, capturas bajo demanda, evidencia historica y estado de alumnos desde una sola consola.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-zinc-500">
            <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 p-3">
              <p className="text-zinc-300">Tiempo real</p>
              <p className="mt-1">Socket docente activo</p>
            </div>
            <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 p-3">
              <p className="text-zinc-300">Evidencia</p>
              <p className="mt-1">Capturas y auditoria</p>
            </div>
            <div className="rounded-lg border border-zinc-900 bg-zinc-950/50 p-3">
              <p className="text-zinc-300">Red</p>
              <p className="mt-1">Whitelist por sesion</p>
            </div>
          </div>
        </section>

        <main className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg border border-zinc-800 bg-zinc-950">
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <h1 className="text-2xl font-semibold">ExamLock</h1>
              <p className="mt-1 text-sm text-zinc-500">Panel docente</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-[#101216] p-6 shadow-2xl">
              <div className="mb-6">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-600">Acceso</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Iniciar sesion</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md border border-rose-900 bg-rose-950/60 px-3 py-2 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <Field label="Email">
                  <input type="email" required autoFocus value={email} onChange={e => setEmail(e.target.value)}
                    className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white
                      outline-none transition focus:border-sky-500" />
                </Field>

                <Field label="Contrasena">
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm text-white
                      outline-none transition focus:border-sky-500" />
                </Field>

                <button type="submit" disabled={loading}
                  className="h-11 w-full rounded-md bg-zinc-100 text-sm font-semibold text-zinc-950 transition
                    hover:bg-white disabled:opacity-50">
                  {loading ? 'Ingresando...' : 'Entrar al panel'}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'Usuario no encontrado.',
    'auth/wrong-password': 'Contrasena incorrecta.',
    'auth/invalid-credential': 'Credenciales invalidas.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta mas tarde.',
  };
  return map[code] ?? 'Error al iniciar sesion.';
}
