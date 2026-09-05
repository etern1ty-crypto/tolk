import { useState } from 'react';
import styles from './Avatar.module.css';

type Props = {
  name: string;
  id?: string;
  avatarUrl?: string;
  size?: number;
  online?: boolean;
  className?: string;
};

function getGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (seed.charCodeAt(i) + ((hash << 5) - hash)) | 0;
  const hue = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${hue}, 45%, 30%), hsl(${(hue + 40) % 360}, 45%, 40%))`;
}

export function Avatar({ name, id, avatarUrl, size = 44, online, className }: Props) {
  // A failed old URL must not suppress a newly uploaded avatar.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const showImage = Boolean(avatarUrl && avatarUrl !== failedUrl);
  const letter = (Array.from(name.trim())[0] ?? '?').toUpperCase();
  return (
    <span
      className={`${styles.root} ${className ?? ''}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      data-online={online ? 'true' : undefined}
      aria-hidden="true"
    >
      <span
        className={styles.inner}
        style={{ background: showImage ? undefined : getGradient(id || name || 'tolk') }}
      >
        {showImage ? (
          <img
            key={avatarUrl}
            src={avatarUrl}
            alt=""
            className={styles.img}
            onError={() => setFailedUrl(avatarUrl ?? null)}
          />
        ) : (
          letter
        )}
      </span>
      {online && <span className={styles.online} />}
    </span>
  );
}
