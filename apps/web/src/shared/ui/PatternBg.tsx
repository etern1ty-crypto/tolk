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

/** Seeded PRNG — mulberry32 */
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ScatteredItem {
  text: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
}

/**
 * Large readable glyphs + dense enough scatter so the field is filled
 * (not a single floating label in empty space).
 */
export function PatternBg({
  pattern,
  seed = pattern.id,
  className,
  density = 'mid',
  children,
}: Props) {
  const isWords =
    pattern.kind === 'words' || pattern.items.some((t) => t.length > 2);

  const scattered = useMemo(() => {
    if (!pattern.items.length) return [] as ScatteredItem[];

    const h = seedHash(seed);
    const rng = mulberry32(h);
    const out: ScatteredItem[] = [];

    // Tight grid in 100×100 viewBox — ~5–8 cells per axis after skips
    // (earlier 40–64 left only 1–2 visible items)
    const stepBase = density === 'low' ? 26 : density === 'high' ? 15 : 19;
    const step = isWords ? stepBase + 5 : stepBase;
    const skipChance = isWords ? 0.18 : 0.12;

    for (let yCoord = -step * 0.5; yCoord < 105; yCoord += step) {
      const row = Math.round((yCoord + step) / step);
      const shift = (row % 2) * (step * 0.45);

      for (let xCoord = -step * 0.5; xCoord < 105; xCoord += step) {
        if (rng() < skipChance) continue;

        const jitterX = (rng() - 0.5) * (step * 0.28);
        const jitterY = (rng() - 0.5) * (step * 0.28);

        const idx = Math.floor(rng() * pattern.items.length);
        const rotate = isWords
          ? -12 + (rng() - 0.5) * 8
          : -18 + (rng() - 0.5) * 12;

        out.push({
          text: pattern.items[idx]!,
          x: xCoord + shift + jitterX,
          y: yCoord + jitterY,
          rotate,
          scale: 0.95 + rng() * 0.35,
          opacity: 0.28 + rng() * 0.32,
        });
      }
    }
    return out;
  }, [pattern, seed, density, isWords]);

  // ~2× old size, but with dense grid so many items remain visible
  // old: size * 1.55 * 0.06 ≈ size * 0.093
  const sizeMul = isWords ? 0.145 : 0.2;
  const baseFontSize = (pattern.size ?? 18) * sizeMul;
  const baseOpacity = Math.min(0.95, (pattern.opacity ?? 0.45) + 0.25);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={{ background: pattern.base }}
    >
      {scattered.length > 0 && (
        <svg
          className={styles.grid}
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
          style={{ opacity: baseOpacity }}
        >
          {scattered.map((item, i) => (
            <text
              key={`${item.text}-${i}`}
              x={item.x}
              y={item.y}
              fontSize={baseFontSize * item.scale}
              fill={pattern.ink || 'currentColor'}
              opacity={item.opacity}
              textAnchor="middle"
              dominantBaseline="central"
              transform={`rotate(${item.rotate}, ${item.x}, ${item.y})`}
              style={{ userSelect: 'none', pointerEvents: 'none' }}
            >
              {item.text}
            </text>
          ))}
        </svg>
      )}
      <div className={styles.veil} />
      {children && <div className={styles.content}>{children}</div>}
    </div>
  );
}
