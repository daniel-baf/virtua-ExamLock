import AppProviders from './providers/AppProviders';
import AppRouter from './router/AppRouter';
import ThemeToggle from '@/shared/ui/theme-toggle/ThemeToggle';

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <ThemeToggle />
    </AppProviders>
  );
}
