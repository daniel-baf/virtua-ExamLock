import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSession } from '../services/sessionsService';

export default function useNewSessionForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [timeLimit, setTimeLimit] = useState(90);
  const [domains, setDomains] = useState([]);
  const [blockInternet, setBlockInternet] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio.');
    setError('');
    setSaving(true);
    try {
      await createSession({ name, timeLimit, whitelist: domains, blockInternet });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return {
    name,
    timeLimit,
    domains,
    blockInternet,
    saving,
    error,
    setName,
    setTimeLimit,
    setDomains,
    setBlockInternet,
    submit,
  };
}
