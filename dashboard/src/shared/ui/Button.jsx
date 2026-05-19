import { Link } from 'react-router-dom';
import styles from './Button.module.css';

export default function Button({
  children,
  className = '',
  disabled = false,
  href,
  onClick,
  target,
  to,
  type,
  variant = 'ghost',
  ...props
}) {
  const rootClassName = [
    styles.button,
    styles[variant] ?? styles.ghost,
    disabled ? styles.disabled : '',
    className,
  ].filter(Boolean).join(' ');

  if (to) {
    return (
      <Link
        to={to}
        onClick={disabled ? event => event.preventDefault() : onClick}
        aria-disabled={disabled || undefined}
        className={rootClassName}
        {...props}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noreferrer' : undefined}
        onClick={disabled ? event => event.preventDefault() : onClick}
        aria-disabled={disabled || undefined}
        className={rootClassName}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      onClick={onClick}
      disabled={disabled}
      className={rootClassName}
      {...props}
    >
      {children}
    </button>
  );
}
