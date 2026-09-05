import { Phone } from 'lucide-react';
import { useLayoutEffect, useRef, type PointerEvent } from 'react';
import {
  clamp,
  createSpring,
  projectMomentum,
  releaseVelocity,
  rubberBand,
  type PointerSample,
} from '../../shared/lib/motion';
import { triggerHaptic } from '../../shared/lib/haptics';
import styles from './CallOverlay.module.css';

export function SwipeToAnswer({ onAnswer, disabled }: { onAnswer: () => void; disabled: boolean }) {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLButtonElement>(null);
  const caption = useRef<HTMLSpanElement>(null);
  const spring = useRef<ReturnType<typeof createSpring> | null>(null);
  const drag = useRef<{
    id: number;
    start: number;
    offset: number;
    samples: PointerSample[];
  } | null>(null);
  const max = () => Math.max(1, (rail.current?.clientWidth ?? 280) - 64);
  useLayoutEffect(() => {
    const controller = createSpring(0, (x) => {
      if (thumb.current) thumb.current.style.transform = `translateX(${x}px)`;
      if (caption.current) caption.current.style.opacity = String(1 - clamp(x / max(), 0, 1));
    });
    spring.current = controller;
    return () => {
      controller.stop();
      spring.current = null;
    };
  }, []);
  useLayoutEffect(() => {
    if (!disabled) spring.current?.to(0);
  }, [disabled]);
  const answer = () => {
    if (!disabled) {
      triggerHaptic('success');
      onAnswer();
    }
  };
  const finish = (e: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    const x = spring.current?.value ?? 0;
    d.samples.push({ position: x, time: e.timeStamp });
    const velocity = cancelled ? 0 : releaseVelocity(d.samples, e.timeStamp);
    if (!cancelled && x >= max() * 0.3 && projectMomentum(x, velocity) >= max() * 0.85) {
      spring.current?.to(max(), { velocity });
      answer();
    } else spring.current?.to(0, { velocity });
  };
  return (
    <div ref={rail} className={styles.answerRail}>
      <span ref={caption} className={styles.answerCaption}>
        {disabled ? 'Соединение…' : 'Смахните, чтобы ответить'}
      </span>
      <button
        ref={thumb}
        type="button"
        className={styles.answerThumb}
        aria-label="Принять звонок"
        disabled={disabled}
        onClick={(e) => {
          if (e.detail === 0) answer();
        }}
        onPointerDown={(e) => {
          if (!e.isPrimary || e.button !== 0 || drag.current || disabled) return;
          e.preventDefault();
          spring.current?.stop();
          const offset = spring.current?.value ?? 0;
          drag.current = {
            id: e.pointerId,
            start: e.clientX,
            offset,
            samples: [{ position: offset, time: e.timeStamp }],
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || d.id !== e.pointerId) return;
          const raw = d.offset + e.clientX - d.start;
          const x =
            raw < 0
              ? rubberBand(raw, 200)
              : raw > max()
                ? max() + rubberBand(raw - max(), 200)
                : raw;
          spring.current?.set(x);
          d.samples.push({ position: x, time: e.timeStamp });
          d.samples = d.samples.filter((s) => e.timeStamp - s.time < 120);
        }}
        onPointerUp={(e) => finish(e)}
        onPointerCancel={(e) => finish(e, true)}
        onLostPointerCapture={(e) => finish(e, true)}
      >
        <Phone size={24} />
      </button>
    </div>
  );
}
