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

/**
 * Seeded PRNG — simple mulberry32
 */
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
 * Patterns are drawn in a 100×100 viewBox.
 * Font sizes are large enough to read; spacing grows with glyph size
 * so words/emoji don't collide when scaled up ~2.5×.
 */
export function PatternBg({
  pattern,
  seed = pattern.id,
  className,
  density = 'mid',
  children,
}: Props) {
  const isWords = pattern.kind === 'words' || pattern.items.some((t) => t.length > 2);

  const scattered = useMemo(() => {
    if (!pattern.items.length) return [] as ScatteredItem[];

    const h = seedHash(seed);
    const rng = mulberry32(h);
    const out: ScatteredItem[] = [];

    // Larger step = more air between glyphs (was ~20–36, now ~40–64)
    const stepBase = density === 'low' ? 58 : density === 'high' ? 40 : 48;
    const step = isWords ? stepBase + 10 : stepBase;
    // Skip more cells when words so long labels don't stack
    const skipChance = isWords ? 0.42 : 0.28;

    for (let yCoord = -step; yCoord < 120; yCoord += step) {
      const row = Math.round((yCoord + step) / step);
      const shift = (row % 2) * (step / 2);

      for (let xCoord = -step; xCoord < 120; xCoord += step) {
        if (rng() < skipChance) continue;

        const jitterX = (rng() - 0.5) * (step * 0.22);
        const jitterY = (rng() - 0.5) * (step * 0.22);

        const finalX = xCoord + shift + jitterX;
        const finalY = yCoord + jitterY;

        const idx = Math.floor(rng() * pattern.items.length);
        const rotate = isWords
          ? -14 + (rng() - 0.5) * 10
          : -20 + (rng() - 0.5) * 14;

        out.push({
          text: pattern.items[idx]!,
          x: finalX,
          y: finalY,
          rotate,
          scale: 1.05 + rng() * 0.35,
          opacity: 0.32 + rng() * 0.28,
        });
      }
    }
    return out;
  }, [pattern, seed, density, isWords]);

  // ~2.5× previous visual size: was (size * 1.55 * 0.06) ≈ size * 0.093
  // now ≈ size * 0.24 for emoji, slightly smaller for multi-letter words
  const sizeMul = isWords ? 0.18 : 0.26;
  const baseFontSize = (pattern.size ?? 18) * sizeMul;
  const baseOpacity = Math.min(0.95, (pattern.opacity ?? 0.45) + 0.28);

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
