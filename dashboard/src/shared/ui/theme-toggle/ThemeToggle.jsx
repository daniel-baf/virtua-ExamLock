import { useTheme } from '@/shared/theme/ThemeContext';
import styles from './ThemeToggle.module.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
    >
      <span className={styles.icon} aria-hidden="true">
        {isDark ? 'L' : 'D'}
      </span>
      <span className={styles.label}>
        {isDark ? 'Claro' : 'Oscuro'}
      </span>
    </button>
  );
}
