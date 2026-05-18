import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { currentTeacherEmail, signOutTeacher } from '@/domains/auth/services/authService';
import { listSessions, resetSessionsData } from '../services/sessionsService';

export default function useSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetting, setResetting] = useState(false);

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

  async function resetData() {
    if (!confirm('Borrar TODOS los datos (sesiones, estudiantes, respuestas, preguntas)?')) return;
    setResetting(true);
    try {
      await resetSessionsData();
      setSessions([]);
    } catch (e) {
      alert('Error al resetear: ' + e.message);
    } finally {
      setResetting(false);
    }
  }

  return {
    sessions,
    loading,
    error,
    resetting,
    teacherEmail: currentTeacherEmail(),
    refresh,
    resetData,
    signOut,
  };
}
