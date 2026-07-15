import { useMemo, type ReactNode } from 'react';
import type { DecorPattern } from '../patterns';
import { seedHash } from '../patterns';
import styles from './PatternBg.module.css';

type Props = {
  pattern: DecorPattern;
  seed?: string;
  className?: string;
  /** denser grid for large banners */
  density?: 'low' | 'mid' | 'high';
  children?: ReactNode;
};

export function PatternBg({
  pattern,
  seed = pattern.id,
  className,
  density = 'mid',
  children,
}: Props) {
  const cells = useMemo(() => {
    const count = density === 'low' ? 24 : density === 'high' ? 72 : 48;
    if (!pattern.items.length) return [] as string[];
    const h = seedHash(seed);
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (h + i * 17) % pattern.items.length;
      out.push(pattern.items[idx]!);
    }
    return out;
  }, [pattern, seed, density]);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ background: pattern.base }}
    >
      {cells.length > 0 && (
        <div
          className={styles.grid}
          style={{
            opacity: pattern.opacity ?? 0.45,
            fontSize: pattern.size ?? 18,
            gap: pattern.gap ?? 10,
            transform: pattern.rotate
              ? `rotate(${pattern.rotate}deg) scale(1.25)`
              : undefined,
            color: pattern.ink,
          }}
          aria-hidden
        >
          {cells.map((item, i) => (
            <span key={`${item}-${i}`} className={styles.cell}>
              {item}
            </span>
          ))}
        </div>
      )}
      <div className={styles.veil} />
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
