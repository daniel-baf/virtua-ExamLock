import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInTeacher } from '../services/authService';

export default function useLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cred = await signInTeacher(email, password);
      const { claims } = await cred.user.getIdTokenResult(true);
      navigate(claims.role === 'admin' ? '/admin/users' : '/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  return { email, password, error, loading, setEmail, setPassword, submit };
}

function friendlyError(code) {
  const map = {
    'auth/user-not-found': 'Usuario no encontrado.',
    'auth/wrong-password': 'Contraseña incorrecta.',
    'auth/invalid-credential': 'Credenciales inválidas.',
    'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
  };
  return map[code] ?? 'Error al iniciar sesión.';
}
