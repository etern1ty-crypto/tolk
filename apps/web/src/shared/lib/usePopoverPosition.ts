import { useLayoutEffect, useState, type RefObject } from 'react';
import { popoverPosition } from './popover';
export function usePopoverPosition(
  ref: RefObject<HTMLElement | null>,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const estimate = () =>
    popoverPosition(x, y, width, height, window.innerWidth, window.innerHeight);
  const [position, setPosition] = useState(estimate);
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      setPosition(
        popoverPosition(
          x,
          y,
          el?.offsetWidth ?? width,
          el?.offsetHeight ?? height,
          window.innerWidth,
          window.innerHeight,
        ),
      );
    };
    measure();
    window.addEventListener('resize', measure);
    const observer = new ResizeObserver(measure);
    if (ref.current) observer.observe(ref.current);
    return () => {
      window.removeEventListener('resize', measure);
      observer.disconnect();
    };
  }, [ref, x, y, width, height]);
  return position;
}
