import AppProviders from '@app/providers/AppProviders';
import AppRouter from '@app/router/AppRouter';
import ThemeToggle from '@shared/ui/theme-toggle/ThemeToggle';

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
      <ThemeToggle />
    </AppProviders>
  );
}
