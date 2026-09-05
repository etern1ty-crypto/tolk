import { useRef, type PointerEvent } from 'react';
import { gaussianScale, prefersReducedMotion } from '../../shared/lib/motion';
import { triggerHaptic } from '../../shared/lib/haptics';
import styles from './ReactionPicker.module.css';

export function ReactionBar({
  emojis,
  onSelect,
  menu = false,
}: {
  emojis: string[];
  onSelect: (emoji: string) => void;
  menu?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const selected = useRef(-1);
  const suppressClick = useRef(false);
  const buttons = () =>
    Array.from(ref.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
  const reset = () => {
    selected.current = -1;
    for (const button of buttons()) {
      button.removeAttribute('data-preview');
      const span = button.firstElementChild as HTMLElement;
      span.style.transform = '';
    }
  };
  const preview = (x: number, y: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    if (x < box.left - 24 || x > box.right + 24 || y < box.top - 32 || y > box.bottom + 32) {
      reset();
      return;
    }
    let closest = -1,
      distance = Infinity;
    const items = buttons();
    items.forEach((button, i) => {
      const b = button.getBoundingClientRect();
      const d = Math.abs(x - (b.left + b.width / 2));
      if (d < distance) {
        closest = i;
        distance = d;
      }
      const scale = prefersReducedMotion() ? 1 : gaussianScale(d);
      const span = button.firstElementChild as HTMLElement;
      span.style.transform = `translateY(${-(scale - 1) * 12}px) scale(${scale})`;
    });
    if (closest !== selected.current) {
      selected.current = closest;
      triggerHaptic('selection');
      items.forEach((button, i) => {
        if (i === closest) button.dataset.preview = 'true';
        else button.removeAttribute('data-preview');
      });
    }
  };
  const finish = (e: PointerEvent<HTMLDivElement>, cancelled = false) => {
    if (pointer.current !== e.pointerId) return;
    pointer.current = null;
    suppressClick.current = true;
    if (!cancelled) preview(e.clientX, e.clientY);
    const index = selected.current;
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
    reset();
    if (!cancelled && index >= 0 && emojis[index]) onSelect(emojis[index]);
  };
  return (
    <div
      ref={ref}
      className={styles.emojis}
      role={menu ? 'group' : 'toolbar'}
      aria-label="Реакции"
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' || !e.isPrimary || e.button !== 0 || pointer.current !== null)
          return;
        pointer.current = e.pointerId;
        suppressClick.current = false;
        e.currentTarget.setPointerCapture(e.pointerId);
        preview(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (pointer.current === e.pointerId) preview(e.clientX, e.clientY);
      }}
      onPointerUp={(e) => finish(e)}
      onPointerCancel={(e) => finish(e, true)}
      onLostPointerCapture={(e) => finish(e, true)}
      onKeyDown={(e) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        e.stopPropagation();
        const list = buttons();
        const i = list.indexOf(document.activeElement as HTMLButtonElement);
        const next =
          e.key === 'Home'
            ? 0
            : e.key === 'End'
              ? list.length - 1
              : (i + (e.key === 'ArrowRight' ? 1 : -1) + list.length) % list.length;
        list[next]?.focus();
      }}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role={menu ? 'menuitem' : undefined}
          aria-label={`Реакция ${emoji}`}
          onClick={(e) => {
            if (suppressClick.current && e.detail !== 0) {
              suppressClick.current = false;
              return;
            }
            suppressClick.current = false;
            onSelect(emoji);
          }}
        >
          <span>{emoji}</span>
        </button>
      ))}
    </div>
  );
}
