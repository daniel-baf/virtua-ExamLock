import { AuthProvider } from '@/domains/auth';
import { ThemeProvider } from '@/shared/theme/ThemeContext';

export default function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
