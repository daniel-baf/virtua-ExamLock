import { AuthProvider } from '@auth';
import { AlertsProvider } from '@shared/alerts/AlertsContext';
import { ThemeProvider } from '@shared/theme/ThemeContext';

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AlertsProvider>{children}</AlertsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
