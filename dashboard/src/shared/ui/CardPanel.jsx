import styles from './CardPanel.module.css';

export default function CardPanel({ as: Tag = 'section', children, className = '' }) {
  return <Tag className={[styles.panel, className].filter(Boolean).join(' ')}>{children}</Tag>;
}
