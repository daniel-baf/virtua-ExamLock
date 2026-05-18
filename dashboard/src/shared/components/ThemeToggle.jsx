import { useTheme } from '@/shared/theme/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? 'L' : 'D'}
      </span>
      <span className="theme-toggle__label">
        {isDark ? 'Claro' : 'Oscuro'}
      </span>
    </button>
  );
}
