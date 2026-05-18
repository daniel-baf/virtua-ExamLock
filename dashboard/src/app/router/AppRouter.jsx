import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuditPage, LoginPage, MonitoringSettingsPage, MonitorPage, NewSessionPage, RequireAuth, SessionsPage, UsersPage } from '@domains';

export default function AppRouter() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
