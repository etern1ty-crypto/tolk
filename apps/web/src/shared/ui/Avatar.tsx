import styles from './Avatar.module.css';

/** Monochrome avatar surfaces */
const PALETTE = [
  'linear-gradient(145deg, #2a2a2a 0%, #5a5a5a 100%)',
  'linear-gradient(145deg, #1a1a1a 0%, #3d3d3d 100%)',
  'linear-gradient(145deg, #333 0%, #666 100%)',
  'linear-gradient(145deg, #222 0%, #4a4a4a 100%)',
  'linear-gradient(145deg, #2e2e2e 0%, #707070 100%)',
];

function hashHue(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h) % PALETTE.length;
}

type Props = {
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
};

export function Avatar({ name, size = 44, online, className }: Props) {
  const letter = (name?.trim()?.[0] ?? '?').toUpperCase();
  const bg = PALETTE[hashHue(name || '?')];

  return (
    <span
      className={`${styles.root} ${className ?? ''}`}
      style={{ width: size, height: size, fontSize: size * 0.36, background: bg }}
      data-online={online || undefined}
      aria-hidden
    >
      {letter}
    </span>
  );
}
