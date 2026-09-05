import { clamp } from './motion.ts';
export function popoverPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const left = clamp(x - width / 2, 8, viewportWidth - width - 8);
  const top = clamp(
    y - height - 12 >= 8 ? y - height - 12 : y + 12,
    8,
    viewportHeight - height - 8,
  );
  return { left, top, transformOrigin: `${x - left}px ${y - top}px` };
}
