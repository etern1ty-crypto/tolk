import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './EchoSheet.module.css';

export function EchoSheet() {
  const open = useAppStore((s) => s.echoSheetOpen);
  const echoes = useAppStore((s) => s.echoes);
  const closeEchoSheet = useAppStore((s) => s.closeEchoSheet);
  const dismissEchoes = useAppStore((s) => s.dismissEchoes);
  const openEchoInChat = useAppStore((s) => s.openEchoInChat);

  const pending = echoes.filter((e) => e.status === 'pending');

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEchoSheet();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeEchoSheet]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="presentation" onClick={closeEchoSheet}>
      <div
        className={styles.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Echo"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        <h2 className={styles.title}>Echo ×{pending.length}</h2>
        <p className={styles.sub}>Тихие сообщения — без ор-пуша</p>

        <ul className={styles.list}>
          {pending.map((e) => (
            <li key={e.id} className={styles.item}>
              <div className={styles.from}>{e.fromName}</div>
              <div className={styles.text}>{e.text}</div>
            </li>
          ))}
          {pending.length === 0 && (
            <li className={styles.empty}>Нет новых Echo</li>
          )}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.secondary} onClick={dismissEchoes}>
            Скрыть
          </button>
          <button type="button" className={styles.primary} onClick={openEchoInChat}>
            Открыть в чате
          </button>
        </div>
      </div>
    </div>
  );
}
