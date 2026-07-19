import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import { iconProps } from '../../shared/ui/icons';
import styles from './ShelfSheet.module.css';

/** Chat Wall (полка этого чата) — bottom sheet on mobile, docked column on desktop */
export function ShelfSheet() {
  const open = useAppStore((s) => s.shelfOpen);
  const setShelfOpen = useAppStore((s) => s.setShelfOpen);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const shelfItems = useAppStore((s) => s.shelfItems);
  const removeFromShelf = useAppStore((s) => s.removeFromShelf);
  const isDesktop = useIsDesktop();

  if (!open || !activeChatId) return null;
  const items = shelfItems.filter((s) => s.chatId === activeChatId);

  const body = (
    <>
      <header className={styles.head}>
        <div>
          <h3>Полка чата</h3>
          <p className={styles.hint}>Закрепы этого диалога</p>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={() => setShelfOpen(false)}
          aria-label="Закрыть"
        >
          <X size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
        </button>
      </header>
      {items.length === 0 ? (
        <p className={styles.empty}>Пусто. Удержание → «Закрепить»</p>
      ) : (
        <ul className={styles.list}>
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
                  <X size={16} strokeWidth={iconProps.strokeWidth} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  /* Desktop: dock into wall column host if present */
  if (isDesktop) {
    const host = document.getElementById('tolk-wall-col');
    if (host) {
      return createPortal(
        <div className={styles.panel} role="dialog" aria-label="Полка чата">
          {body}
        </div>,
        host
      );
    }
    return (
      <div className={styles.overlay} onClick={() => setShelfOpen(false)} role="presentation">
        <div className={styles.desktopSheet} role="dialog" onClick={(e) => e.stopPropagation()}>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={() => setShelfOpen(false)} role="presentation">
      <div className={styles.sheet} role="dialog" onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} aria-hidden />
        {body}
      </div>
    </div>
  );
}
