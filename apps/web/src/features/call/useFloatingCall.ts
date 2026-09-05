import {
  useLayoutEffect,
  useRef,
  type RefObject,
  type PointerEvent,
  type KeyboardEvent,
} from 'react';
import {
  clamp,
  createSpring,
  projectMomentum,
  releaseVelocity,
  rubberBand,
  type PointerSample,
} from '../../shared/lib/motion';

type Drag = {
  id: number;
  x: number;
  y: number;
  originX: number;
  originY: number;
  xs: PointerSample[];
  ys: PointerSample[];
};
const bounds = () => ({
  x: Math.max(16, window.innerWidth - 336),
  y: Math.max(16, window.innerHeight - 216),
});

export function useFloatingCall(root: RefObject<HTMLDivElement | null>, compact: boolean) {
  const position = useRef<{ x: number; y: number } | null>(null);
  const xSpring = useRef<ReturnType<typeof createSpring> | null>(null);
  const ySpring = useRef<ReturnType<typeof createSpring> | null>(null);
  const drag = useRef<Drag | null>(null);
  useLayoutEffect(() => {
    if (!compact) {
      if (root.current) root.current.style.transform = '';
      return;
    }
    const max = bounds();
    const p = position.current ?? { x: max.x, y: max.y };
    position.current = { x: clamp(p.x, 16, max.x), y: clamp(p.y, 16, max.y) };
    const draw = () => {
      if (root.current && position.current)
        root.current.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
    };
    const x = createSpring(position.current.x, (v) => {
      position.current!.x = v;
      draw();
    });
    const y = createSpring(position.current.y, (v) => {
      position.current!.y = v;
      draw();
    });
    xSpring.current = x;
    ySpring.current = y;
    draw();
    const resize = () => {
      const max = bounds();
      x.to(x.value < (16 + max.x) / 2 ? 16 : max.x);
      y.to(y.value < (16 + max.y) / 2 ? 16 : max.y);
    };
    window.addEventListener('resize', resize);
    return () => {
      x.stop();
      y.stop();
      xSpring.current = null;
      ySpring.current = null;
      drag.current = null;
      window.removeEventListener('resize', resize);
    };
  }, [compact, root]);

  const finish = (e: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    const x = xSpring.current,
      y = ySpring.current;
    if (!x || !y) return;
    d.xs.push({ position: x.value, time: e.timeStamp });
    d.ys.push({ position: y.value, time: e.timeStamp });
    const vx = cancelled ? 0 : releaseVelocity(d.xs, e.timeStamp),
      vy = cancelled ? 0 : releaseVelocity(d.ys, e.timeStamp);
    const max = bounds();
    x.to(projectMomentum(x.value, vx) < (16 + max.x) / 2 ? 16 : max.x, { velocity: vx });
    y.to(projectMomentum(y.value, vy) < (16 + max.y) / 2 ? 16 : max.y, { velocity: vy });
  };
  return {
    onPointerDown(e: PointerEvent<HTMLButtonElement>) {
      if (!e.isPrimary || e.button !== 0 || drag.current) return;
      const x = xSpring.current,
        y = ySpring.current;
      if (!x || !y) return;
      x.stop();
      y.stop();
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        originX: x.value,
        originY: y.value,
        xs: [{ position: x.value, time: e.timeStamp }],
        ys: [{ position: y.value, time: e.timeStamp }],
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove(e: PointerEvent<HTMLButtonElement>) {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const max = bounds();
      const resist = (v: number, bound: number) =>
        v < 16 ? 16 + rubberBand(v - 16) : v > bound ? bound + rubberBand(v - bound) : v;
      const x = resist(d.originX + e.clientX - d.x, max.x),
        y = resist(d.originY + e.clientY - d.y, max.y);
      xSpring.current?.set(x);
      ySpring.current?.set(y);
      d.xs.push({ position: x, time: e.timeStamp });
      d.ys.push({ position: y, time: e.timeStamp });
      d.xs = d.xs.filter((s) => e.timeStamp - s.time < 120);
      d.ys = d.ys.filter((s) => e.timeStamp - s.time < 120);
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => finish(e),
    onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => finish(e, true),
    onLostPointerCapture: (e: PointerEvent<HTMLButtonElement>) => finish(e, true),
    onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
      const max = bounds();
      if (e.key === 'ArrowLeft') xSpring.current?.set(16);
      else if (e.key === 'ArrowRight') xSpring.current?.set(max.x);
      else if (e.key === 'ArrowUp') ySpring.current?.set(16);
      else if (e.key === 'ArrowDown') ySpring.current?.set(max.y);
      else return;
      e.preventDefault();
    },
  };
}
