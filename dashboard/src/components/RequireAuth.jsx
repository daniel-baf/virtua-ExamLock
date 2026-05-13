import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (state === 'anon') return <Navigate to="/" replace />;
  if (state === 'wrong_role') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-red-400 mb-2">Esta cuenta no tiene acceso de docente.</p>
          <button onClick={() => auth.signOut()} className="text-sm text-gray-400 underline">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }
  return children;
}
