import { Check } from 'lucide-react';
import styles from './VerifiedBadge.module.css';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerifiedBadge({ size = 'md', className = '' }: VerifiedBadgeProps) {
  const sizePx = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const iconSize = size === 'sm' ? 9 : size === 'lg' ? 12 : 10;

  return (
    <span
      className={`${styles.badge} ${styles[size]} ${className}`}
      title="Подтверждённый аккаунт"
      aria-label="Подтверждённый аккаунт"
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
    >
      <Check size={iconSize} strokeWidth={3.5} className={styles.icon} />
    </span>
  );
}
