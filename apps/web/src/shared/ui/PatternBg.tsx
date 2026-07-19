import { useMemo, type ReactNode } from 'react';
import type { DecorPattern } from '../patterns';
import { seedHash } from '../patterns';
import styles from './PatternBg.module.css';

type Props = {
  pattern: DecorPattern;
  seed?: string;
  className?: string;
  density?: 'low' | 'mid' | 'high';
  children?: ReactNode;
};

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
 * Dense scatter of large glyphs — fills the surface (chat wallpaper / banner).
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

    // Dense grid in 100×100 viewBox (~8–12 cells per axis)
    const stepBase = density === 'low' ? 14 : density === 'high' ? 9 : 11;
    const step = isWords ? stepBase + 3 : stepBase;
    // Almost no skips — user wants a filled pattern, not sparse dots
    const skipChance = isWords ? 0.08 : 0.04;

    for (let yCoord = -step; yCoord <= 110; yCoord += step) {
      const row = Math.round((yCoord + step) / step);
      const shift = (row % 2) * (step * 0.5);

      for (let xCoord = -step; xCoord <= 110; xCoord += step) {
        if (rng() < skipChance) continue;

        const jitterX = (rng() - 0.5) * (step * 0.35);
        const jitterY = (rng() - 0.5) * (step * 0.35);
        const idx = Math.floor(rng() * pattern.items.length);

        out.push({
          text: pattern.items[idx]!,
          x: xCoord + shift + jitterX,
          y: yCoord + jitterY,
          rotate: isWords
            ? -10 + (rng() - 0.5) * 8
            : -16 + (rng() - 0.5) * 14,
          scale: 0.9 + rng() * 0.4,
          opacity: 0.3 + rng() * 0.35,
        });
      }
    }
    return out;
  }, [pattern, seed, density, isWords]);

  // Readable size without killing density
  // old tiny: size * 0.093 · previous dense attempt ~0.2
  const sizeMul = isWords ? 0.13 : 0.18;
  const baseFontSize = (pattern.size ?? 18) * sizeMul;
  const baseOpacity = Math.min(0.96, (pattern.opacity ?? 0.45) + 0.28);

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
