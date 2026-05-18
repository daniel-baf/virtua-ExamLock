import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mergeDomainLists, normalizeDomainList } from '../domainModel';
import { createSession, getNetworkDefaults } from '../services/sessionsService';

export default function useNewSessionForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [timeLimit, setTimeLimit] = useState(90);
  const [domains, setDomains] = useState([]);
  const [blockInternet, setBlockInternet] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultLoading, setDefaultLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('El nombre es obligatorio.');
    setError('');
    setSaving(true);
    try {
      await createSession({ name, timeLimit, whitelist: normalizeDomainList(domains), blockInternet });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function loadDefaultDomains() {
    setDefaultLoading(true);
    setError('');
    try {
      const { whitelist } = await getNetworkDefaults();
      setDomains(current => mergeDomainLists(current, whitelist, 'default'));
    } catch (err) {
      setError(err.message);
    } finally {
      setDefaultLoading(false);
    }
  }

  return {
    name,
    timeLimit,
    domains,
    blockInternet,
    saving,
    defaultLoading,
    error,
    setName,
    setTimeLimit,
    setDomains,
    setBlockInternet,
    loadDefaultDomains,
    submit,
  };
}
