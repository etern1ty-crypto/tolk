import styles from './Avatar.module.css';

type Props = {
  name: string;
  size?: number;
  online?: boolean;
  className?: string;
};

/** Black disc + white letter — clean, no gradient clown faces */
export function Avatar({ name, size = 44, online, className }: Props) {
  const letter = (name?.trim()?.[0] ?? '?').toUpperCase();

  return (
    <span
      className={`${styles.root} ${className ?? ''}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      data-online={online || undefined}
      aria-hidden
    >
      {letter}
    </span>
  );
}
