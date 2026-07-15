import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './ReactionPicker.module.css';

export function ReactionPicker() {
  const picker = useAppStore((s) => s.reactionPicker);
  const emojis = useAppStore((s) => s.reactionEmojis);
  const setReactionPicker = useAppStore((s) => s.setReactionPicker);
  const toggleReaction = useAppStore((s) => s.toggleReaction);

  useEffect(() => {
    if (!picker) return;
    const close = () => setReactionPicker(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [picker, setReactionPicker]);

  if (!picker) return null;

  const x = Math.min(picker.x, window.innerWidth - 260);
  const y = Math.max(8, picker.y - 56);

  return (
    <div
      className={styles.bar}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
      role="toolbar"
      aria-label="Реакции"
    >
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => toggleReaction(picker.messageId, emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
