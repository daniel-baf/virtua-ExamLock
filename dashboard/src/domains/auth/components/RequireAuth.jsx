import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '@/shared/lib/firebase';

export default function RequireAuth({ children, allow = ['teacher'] }) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0c]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-sky-400" />
      </div>
    );
  }
  if (!role) return <Navigate to="/" replace />;
  if (!allow.includes(role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090a0c] text-white">
        <div className="text-center">
          <p className="mb-2 text-rose-300">Esta cuenta no tiene acceso a esta sección.</p>
          <button onClick={() => auth.signOut()} className="text-sm text-zinc-500 underline hover:text-zinc-200">
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }
  return children;
}
