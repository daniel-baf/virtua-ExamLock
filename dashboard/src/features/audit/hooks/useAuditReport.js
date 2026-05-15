import { useEffect, useState } from 'react';
import { getSessionAudit } from '../services/auditService';

export default function useAuditReport(sessionId) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    getSessionAudit(sessionId)
      .then(setData)
      .catch(err => setError(err.message));
  }, [sessionId]);

  function toggleStudent(uid) {
    setExpanded(prev => ({ ...prev, [uid]: !prev[uid] }));
  }

  return { data, error, expanded, toggleStudent };
}
