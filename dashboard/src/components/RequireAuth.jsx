import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Navigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function RequireAuth({ children }) {
  const [state, setState] = useState('loading'); // 'loading' | 'authed' | 'anon'

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setState(user ? 'authed' : 'anon');
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
  return children;
}
