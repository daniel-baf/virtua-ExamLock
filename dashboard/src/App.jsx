import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import RequireAuth from '@/features/auth/components/RequireAuth';
import LoginPage from '@/features/auth/LoginPage';
import SessionsPage from '@/features/sessions/pages/SessionsPage';
import NewSessionPage from '@/features/sessions/pages/NewSessionPage';
import MonitorPage from '@/features/monitoring/pages/MonitorPage';
import AuditPage from '@/features/audit/pages/AuditPage';
import UsersPage from '@/features/users/pages/UsersPage';
import MonitoringSettingsPage from '@/features/admin/pages/MonitoringSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/dashboard" element={<RequireAuth><SessionsPage /></RequireAuth>} />
          <Route path="/session/new" element={<RequireAuth><NewSessionPage /></RequireAuth>} />
          <Route path="/session/:id/monitor" element={<RequireAuth><MonitorPage /></RequireAuth>} />
          <Route path="/session/:id/audit" element={<RequireAuth><AuditPage /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth allow={['admin']}><UsersPage /></RequireAuth>} />
          <Route path="/admin/monitoring" element={<RequireAuth allow={['admin']}><MonitoringSettingsPage /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
