import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '@/shared/lib/firebase';

export default function RequireAuth({ children }) {
  const [state, setState] = useState('loading'); // 'loading' | 'ok' | 'anon' | 'wrong_role'

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (!user) return setState('anon');
      try {
        const result = await user.getIdTokenResult(true);
        setState(result.claims.role === 'teacher' ? 'ok' : 'wrong_role');
      } catch {
        setState('anon');
      }
    });
  }, []);

  if (state === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0c]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
      </div>
    );
  }
  if (state === 'anon') return <Navigate to="/" replace />;
  if (state === 'wrong_role') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0c] text-white">
        <div className="text-center">
          <p className="mb-2 text-rose-300">Esta cuenta no tiene acceso de docente.</p>
          <button onClick={() => auth.signOut()} className="text-sm text-zinc-500 underline hover:text-zinc-200">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }
  return children;
}
