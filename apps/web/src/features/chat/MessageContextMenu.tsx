import { Bookmark, CheckSquare, Copy, Pencil, Reply, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import { usePopoverPosition } from '../../shared/lib/usePopoverPosition';
import { ReactionBar } from './ReactionBar';
import styles from './MessageContextMenu.module.css';

type Menu = { messageId: string; x: number; y: number; keyboard?: boolean };
export function MessageContextMenu() {
  const menu = useAppStore((s) => s.contextMenu);
  return menu ? <MenuContent key={`${menu.messageId}:${menu.x}:${menu.y}`} menu={menu} /> : null;
}
function MenuContent({ menu }: { menu: Menu }) {
  const close = useAppStore((s) => s.setContextMenu);
  const pin = useAppStore((s) => s.pinToShelf);
  const remove = useAppStore((s) => s.deleteMessage);
  const edit = useAppStore((s) => s.setEditingMessage);
  const select = useAppStore((s) => s.startMessageSelection);
  const reply = useAppStore((s) => s.setReplyTo);
  const toggle = useAppStore((s) => s.toggleReaction);
  const emojis = useAppStore((s) => s.reactionEmojis);
  const meId = useAppStore((s) => s.me.id);
  const message = useAppStore((s) => s.messages.find((m) => m.id === menu.messageId));
  const ref = useRef<HTMLDivElement>(null);
  const position = usePopoverPosition(ref, menu.x, menu.y, 300, 356);
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    ref.current?.focus({ preventScroll: true });
    const outside = (e: globalThis.PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) close(null);
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      if (
        previous?.isConnected &&
        (document.activeElement === document.body || ref.current?.contains(document.activeElement))
      )
        previous.focus({ preventScroll: true });
    };
  }, [close]);
  if (!message) return null;
  const run = (action: () => unknown) => {
    close(null);
    void action();
  };
  return (
    <div
      ref={ref}
      className={styles.menu}
      style={position}
      role="menu"
      aria-label="Действия с сообщением"
      tabIndex={-1}
      data-keyboard={menu.keyboard || undefined}
      onKeyDown={(e) => {
        if (e.key === 'Escape' || e.key === 'Tab') {
          e.preventDefault();
          e.stopPropagation();
          close(null);
          return;
        }
        const buttons = Array.from(
          ref.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [],
        );
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        let next = current;
        if (e.key === 'ArrowDown') next = (current + 1) % buttons.length;
        else if (e.key === 'ArrowUp')
          next = current < 0 ? buttons.length - 1 : (current - 1 + buttons.length) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        else if (e.key === 'Enter' && current < 0) {
          e.preventDefault();
          buttons[0]?.click();
          return;
        } else return;
        e.preventDefault();
        e.stopPropagation();
        buttons[next]?.focus();
      }}
    >
      <div className={styles.reactions}>
        <ReactionBar
          menu
          emojis={emojis}
          onSelect={(emoji) => run(() => toggle(message.id, emoji))}
        />
      </div>
      <button type="button" role="menuitem" onClick={() => run(() => reply(message.id))}>
        <Reply size={16} /> Ответить
      </button>
      <button type="button" role="menuitem" onClick={() => run(() => select(message.id))}>
        <CheckSquare size={16} /> Выделить
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!message.text}
        onClick={() =>
          run(async () => {
            try {
              await navigator.clipboard.writeText(message.text);
              useAppStore.getState().showToast('Текст скопирован');
            } catch {
              useAppStore.getState().showToast('Не удалось скопировать текст');
            }
          })
        }
      >
        <Copy size={16} /> Копировать
      </button>
      <button type="button" role="menuitem" onClick={() => run(() => pin(message.id))}>
        <Bookmark size={16} /> На полку
      </button>
      {message.senderId === meId && message.kind === 'text' && !message.deleted && (
        <button type="button" role="menuitem" onClick={() => run(() => edit(message.id))}>
          <Pencil size={16} /> Изменить
        </button>
      )}
      <button
        type="button"
        role="menuitem"
        className={styles.danger}
        onClick={() => run(() => remove(message.id))}
      >
        <Trash2 size={16} /> Удалить
      </button>
    </div>
  );
}
