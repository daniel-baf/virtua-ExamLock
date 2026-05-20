import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentTeacherEmail, signOutTeacher } from '@/domains/auth/services/authService';
import { listSessions } from '../services/sessionsService';

export default function useSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listSessions();
      setSessions(data.sessions);
    } catch (e) {
      setError('No se pudieron cargar las sesiones: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await listSessions();
        if (!cancelled) setSessions(data.sessions);
      } catch (e) {
        if (!cancelled) setError('No se pudieron cargar las sesiones: ' + e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  async function signOut() {
    await signOutTeacher();
    navigate('/');
  }

  return {
    sessions,
    loading,
    error,
    teacherEmail: currentTeacherEmail(),
    refresh,
    signOut,
  };
}
