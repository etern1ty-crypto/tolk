import { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './AttachSheet.module.css';

export function AttachSheet() {
  const open = useAppStore((s) => s.attachSheetOpen);
  const setAttachSheetOpen = useAppStore((s) => s.setAttachSheetOpen);
  const sendMessage = useAppStore((s) => s.sendMessage);
  const uploadAttachment = useAppStore((s) => s.uploadAttachment);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAttachSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setAttachSheetOpen]);

  if (!open) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachment(file, 'media');
      setAttachSheetOpen(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachment(file, 'file');
      setAttachSheetOpen(false);
    }
  };

  const pickVoiceMock = () => {
    sendMessage('Голосовое сообщение', {
      kind: 'voice',
      media: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        durationSec: 10,
        filename: 'voice.mp3'
      }
    });
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
        
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
        <input
          type="file"
          ref={fileInputRef}
          accept="*/*"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <button type="button" onClick={() => imageInputRef.current?.click()}>
          📷 Фото
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          📄 Файл
        </button>
        <button type="button" onClick={pickVoiceMock}>
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
