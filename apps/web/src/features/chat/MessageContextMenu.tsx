import { Bookmark, Copy, Reply, SmilePlus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './MessageContextMenu.module.css';

export function MessageContextMenu() {
  const menu = useAppStore((s) => s.contextMenu);
  const setContextMenu = useAppStore((s) => s.setContextMenu);
  const setReactionPicker = useAppStore((s) => s.setReactionPicker);
  const pinToShelf = useAppStore((s) => s.pinToShelf);
  const deleteMessage = useAppStore((s) => s.deleteMessage);
  const setReplyTo = useAppStore((s) => s.setReplyTo);
  const messages = useAppStore((s) => s.messages);

  useEffect(() => {
    if (!menu) return;
    const close = () => setContextMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('click', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu, setContextMenu]);

  if (!menu) return null;
  const msg = messages.find((m) => m.id === menu.messageId);
  if (!msg) return null;

  const x = Math.min(menu.x, window.innerWidth - 220);
  const y = Math.min(menu.y, window.innerHeight - 260);

  return (
    <div
      className={styles.menu}
      style={{ left: x, top: y }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setReactionPicker({ messageId: msg.id, x: menu.x, y: menu.y });
          setContextMenu(null);
        }}
      >
        <SmilePlus size={16} /> Реакция
      </button>
      <button type="button" role="menuitem" onClick={() => setReplyTo(msg.id)}>
        <Reply size={16} /> Ответить
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          void navigator.clipboard?.writeText(msg.text);
          setContextMenu(null);
        }}
      >
        <Copy size={16} /> Копировать
      </button>
      <button type="button" role="menuitem" onClick={() => pinToShelf(msg.id)}>
        <Bookmark size={16} /> На полку
      </button>
      <button
        type="button"
        role="menuitem"
        className={styles.danger}
        onClick={() => deleteMessage(msg.id)}
      >
        <Trash2 size={16} /> Удалить
      </button>
    </div>
  );
}
