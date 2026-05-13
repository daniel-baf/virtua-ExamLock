import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from './components/RequireAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SessionNew from './pages/SessionNew';
import Monitor from './pages/Monitor';
import Results from './pages/Results';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/session/new" element={<RequireAuth><SessionNew /></RequireAuth>} />
        <Route path="/session/:id/monitor" element={<RequireAuth><Monitor /></RequireAuth>} />
        <Route path="/session/:id/results" element={<RequireAuth><Results /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
