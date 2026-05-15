import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RequireAuth from '@/features/auth/components/RequireAuth';
import LoginPage from '@/features/auth/LoginPage';
import SessionsPage from '@/features/sessions/pages/SessionsPage';
import NewSessionPage from '@/features/sessions/pages/NewSessionPage';
import MonitorPage from '@/features/monitoring/pages/MonitorPage';
import AuditPage from '@/features/audit/pages/AuditPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<RequireAuth><SessionsPage /></RequireAuth>} />
        <Route path="/session/new" element={<RequireAuth><NewSessionPage /></RequireAuth>} />
        <Route path="/session/:id/monitor" element={<RequireAuth><MonitorPage /></RequireAuth>} />
        <Route path="/session/:id/audit" element={<RequireAuth><AuditPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
