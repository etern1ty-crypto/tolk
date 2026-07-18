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

export function PatternBg({
  pattern,
  seed = pattern.id,
  className,
  density = 'mid',
  children,
}: Props) {
  const scattered = useMemo(() => {
    if (!pattern.items.length) return [] as ScatteredItem[];

    const h = seedHash(seed);
    const rng = mulberry32(h);
    const out: ScatteredItem[] = [];

    // Larger step + scale → more readable glyphs (not a noisy confetti field)
    const step = density === 'low' ? 32 : density === 'high' ? 14 : 22;
    
    for (let yCoord = -step; yCoord < 120; yCoord += step) {
      const row = Math.round((yCoord + step) / step);
      const shift = (row % 2) * (step / 2);
      
      for (let xCoord = -step; xCoord < 120; xCoord += step) {
        const jitterX = (rng() - 0.5) * (step * 0.25);
        const jitterY = (rng() - 0.5) * (step * 0.25);
        
        const finalX = xCoord + shift + jitterX;
        const finalY = yCoord + jitterY;
        
        const idx = Math.floor(rng() * pattern.items.length);
        const rotate = -30 + (rng() - 0.5) * 15;
        
        out.push({
          text: pattern.items[idx]!,
          x: finalX,
          y: finalY,
          rotate,
          scale: 1.05 + rng() * 0.45,
          opacity: 0.28 + rng() * 0.18,
        });
      }
    }
    return out;
  }, [pattern, seed, density]);

  const baseFontSize = (pattern.size ?? 18) * 1.15;
  const baseOpacity = Math.min(0.72, (pattern.opacity ?? 0.45) + 0.12);

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
              fontSize={baseFontSize * item.scale * 0.06}
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
