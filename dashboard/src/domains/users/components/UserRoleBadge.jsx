import { USER_ROLE_LABELS, USER_ROLE_TONES } from '@users/constants/userRoles';
import styles from '@users/styles/Users.module.css';

export default function UserRoleBadge({ role }) {
  const tone = USER_ROLE_TONES[role] ?? 'neutral';
  const label = USER_ROLE_LABELS[role] ?? role ?? 'Sin rol';

  return <span className={`${styles.badge} ${styles[`badge${capitalize(tone)}`] ?? styles.badgeNeutral}`}>{label}</span>;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Neutral';
}
