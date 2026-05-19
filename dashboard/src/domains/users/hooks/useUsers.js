import { useState, useEffect, useCallback } from 'react';
import { listUsers, createUser, updateUser, deleteUser } from '../services/usersService';

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers();
      setUsers(data.users);
    } catch (err) {
      setError(err.message ?? 'Error al cargar usuarios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(body) {
    await createUser(body);
    await load();
  }

  async function update(uid, body) {
    await updateUser(uid, body);
    await load();
  }

  async function remove(uid) {
    await deleteUser(uid);
    await load();
  }

  return { users, loading, error, create, update, remove, refresh: load };
}
