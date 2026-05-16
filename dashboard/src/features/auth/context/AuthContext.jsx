import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/shared/lib/firebase';

const AuthContext = createContext({ role: null, user: null, loading: true });

export function AuthProvider({ children }) {
  const [state, setState] = useState({ role: null, user: null, loading: true });

  useEffect(() => {
    return onAuthStateChanged(auth, async user => {
      if (!user) return setState({ role: null, user: null, loading: false });
      try {
        const result = await user.getIdTokenResult(true);
        setState({ role: result.claims.role ?? null, user, loading: false });
      } catch {
        setState({ role: null, user: null, loading: false });
      }
    });
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
