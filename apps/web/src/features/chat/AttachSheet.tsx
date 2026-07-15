import { useEffect } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './AttachSheet.module.css';

export function AttachSheet() {
  const open = useAppStore((s) => s.attachSheetOpen);
  const setAttachSheetOpen = useAppStore((s) => s.setAttachSheetOpen);
  const sendMessage = useAppStore((s) => s.sendMessage);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAttachSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setAttachSheetOpen]);

  if (!open) return null;

  const pick = (label: string) => {
    sendMessage(`[${label}] mock attachment`);
    setAttachSheetOpen(false);
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={() => setAttachSheetOpen(false)}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-label="Вложение"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className={styles.title}>Вложение</h3>
        <button type="button" onClick={() => pick('Фото')}>
          📷 Фото
        </button>
        <button type="button" onClick={() => pick('Файл')}>
          📄 Файл
        </button>
        <button type="button" onClick={() => pick('Войс')}>
          🎙 Голосовое
        </button>
        <button
          type="button"
          className={styles.cancel}
          onClick={() => setAttachSheetOpen(false)}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
