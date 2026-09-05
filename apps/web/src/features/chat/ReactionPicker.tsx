import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { usePopoverPosition } from '../../shared/lib/usePopoverPosition';
import { ReactionBar } from './ReactionBar';
import styles from './ReactionPicker.module.css';

type Picker = { messageId: string; x: number; y: number };
export function ReactionPicker() {
  const picker = useAppStore((s) => s.reactionPicker);
  return picker ? (
    <PickerContent key={`${picker.messageId}:${picker.x}:${picker.y}`} picker={picker} />
  ) : null;
}
function PickerContent({ picker }: { picker: Picker }) {
  const emojis = useAppStore((s) => s.reactionEmojis);
  const close = useAppStore((s) => s.setReactionPicker);
  const toggle = useAppStore((s) => s.toggleReaction);
  const ref = useRef<HTMLDivElement>(null);
  const position = usePopoverPosition(
    ref,
    picker.x,
    picker.y,
    Math.min(300, emojis.length * 46 + 16),
    64,
  );
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.querySelector('button')?.focus({ preventScroll: true });
    const outside = (e: globalThis.PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      previous?.isConnected && previous.focus({ preventScroll: true });
    };
  }, [close]);
  return (
    <div
      ref={ref}
      className={styles.bar}
      style={position}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Tab') {
          e.stopPropagation();
          if (e.key === 'Escape') e.preventDefault();
          close(null);
        }
      }}
    >
      <ReactionBar
        emojis={emojis}
        onSelect={(emoji) => {
          close(null);
          void toggle(picker.messageId, emoji);
        }}
      />
    </div>
  );
}
