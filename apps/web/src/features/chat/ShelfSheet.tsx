import { useAppStore } from '../../store/appStore';
import styles from './ShelfSheet.module.css';

export function ShelfSheet() {
  const open = useAppStore((s) => s.shelfOpen);
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const shelfItems = useAppStore((s) => s.shelfItems);

  if (!open) return null;
  const items = shelfItems.filter((s) => s.chatId === activeChatId);

  return (
    <div className={styles.overlay} onClick={() => setShelfOpen(false)} role="presentation">
      <div className={styles.sheet} role="dialog" onClick={(e) => e.stopPropagation()}>
        <h3>Полка чата</h3>
        <p className={styles.hint}>Закрепы этого диалога · не стена</p>
        {items.length === 0 ? (
          <p className={styles.empty}>Пусто. ПКМ → «На полку»</p>
        ) : (
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <p>{item.text}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShelfOpen(false);
                    document
                      .getElementById(`msg-${item.messageId}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                >
                  В чат
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
