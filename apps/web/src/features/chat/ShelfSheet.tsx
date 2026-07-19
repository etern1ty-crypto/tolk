import { X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './ShelfSheet.module.css';

export function ShelfSheet() {
  const open = useAppStore((s) => s.shelfOpen);
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const shelfItems = useAppStore((s) => s.shelfItems);
  const removeFromShelf = useAppStore((s) => s.removeFromShelf);

  if (!open) return null;
  const items = shelfItems.filter((s) => s.chatId === activeChatId);

  return (
    <div className={styles.overlay} onClick={() => setShelfOpen(false)} role="presentation">
      <div className={styles.sheet} role="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Полка чата</h3>
        <p className={styles.hint}>Закрепы этого диалога · не стена</p>
        {items.length === 0 ? (
          <p className={styles.empty}>Пусто. Удержание → «На полку»</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                {item.mediaUrl && (
                  <img src={item.mediaUrl} alt="" className={styles.thumb} />
                )}
                <p>{item.text}</p>
                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShelfOpen(false);
                      document
                        .getElementById(`msg-${item.messageId}`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      useAppStore.setState({ highlightMessageId: item.messageId });
                      window.setTimeout(
                        () => useAppStore.setState({ highlightMessageId: null }),
                        2000
                      );
                    }}
                  >
                    В чат
                  </button>
                  <button
                    type="button"
                    className={styles.remove}
                    aria-label="Убрать с полки"
                    onClick={() => removeFromShelf(item.id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
