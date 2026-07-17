import styles from './Avatar.module.css';

type Props = {
  name: string;
  id?: string;
  avatarUrl?: string;
  size?: number;
  online?: boolean;
  className?: string;
};

function getHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getGradient(seed: string): string {
  const hash = getHash(seed);
  const hue1 = hash % 360;
  const hue2 = (hue1 + 40 + (hash % 80)) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 65%, 38%) 0%, hsl(${hue2}, 70%, 48%) 100%)`;
}

/** Hashed SVG-like gradient or custom image avatar component */
export function Avatar({ name, id, avatarUrl, size = 44, online, className }: Props) {
  const letter = (name?.trim()?.[0] ?? '?').toUpperCase();
  const background = avatarUrl ? 'transparent' : getGradient(id || name || 'default');

  return (
    <span
      className={`${styles.root} ${className ?? ''}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background,
      }}
      data-online={online || undefined}
      aria-hidden
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className={styles.img} />
      ) : (
        letter
      )}
    </span>
  );
}
