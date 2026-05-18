import { USER_ROLE_LABELS, USER_ROLE_TONES } from '../constants/userRoles';

export default function UserRoleBadge({ role }) {
  const tone = USER_ROLE_TONES[role] ?? 'neutral';
  const label = USER_ROLE_LABELS[role] ?? role ?? 'Sin rol';

  return <span className={`user-badge user-badge--${tone}`}>{label}</span>;
}
