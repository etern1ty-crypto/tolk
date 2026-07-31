import { Bookmark, CheckSquare, Copy, Pencil, Reply, Trash2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './MessageContextMenu.module.css';

export function MessageContextMenu() {
  const menu = useAppStore((s) => s.contextMenu);
  const setContextMenu = useAppStore((s) => s.setContextMenu);
  const pinToShelf = useAppStore((s) => s.pinToShelf);
  const deleteMessage = useAppStore((s) => s.deleteMessage);
  const setEditingMessage = useAppStore((s) => s.setEditingMessage);
  // @ts-ignore
  const startMessageSelection = useAppStore((s) => s.startMessageSelection);
  const me = useAppStore((s) => s.me);
  const setReplyTo = useAppStore((s) => s.setReplyTo);
  const toggleReaction = useAppStore((s) => s.toggleReaction);
  const emojis = useAppStore((s) => s.reactionEmojis);
  const messages = useAppStore((s) => s.messages);
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

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

  useLayoutEffect(() => {
    if (!menu || !ref.current) return;
    const el = ref.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const pad = 10;
    // Prefer near message bubble, then clamp to viewport
    let left = menu.x - w / 2;
    let top = menu.y - h - 12;
    if (top < pad) top = menu.y + 12;
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - h - pad));
    setPos({ left, top });
  }, [menu]);

  if (!menu) return null;
  const msg = messages.find((m) => m.id === menu.messageId);
  if (!msg) return null;

  return (
    <div
      ref={ref}
      className={styles.menu}
      style={{ left: pos.left, top: pos.top }}
      role="menu"
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.reactions} role="toolbar" aria-label="Реакции">
        {emojis.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={styles.reactionBtn}
            onClick={() => {
              toggleReaction(msg.id, emoji);
              setContextMenu(null);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
      <button type="button" role="menuitem" onClick={() => setReplyTo(msg.id)}>
        <Reply size={16} /> Ответить
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          setContextMenu(null);
          startMessageSelection(msg.id);
        }}
      >
        <CheckSquare size={16} /> Выделить
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
      {/* Править можно только свой текст: голосовое или кружок «изменить» на
          произвольные слова — это подделка, а не правка. Сервер это и так
          запрещает, но предлагать пункт, который откажет, незачем. */}
      {msg.senderId === me.id && msg.kind === 'text' && !msg.deleted && (
        <button type="button" role="menuitem" onClick={() => setEditingMessage(msg.id)}>
          <Pencil size={16} /> Изменить
        </button>
      )}
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
