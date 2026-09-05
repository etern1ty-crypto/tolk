import { useEffect, useRef } from 'react';
import { Image as ImageIcon, FileText, Mic } from 'lucide-react';
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
        <div className={styles.handleBar} aria-hidden="true" />
        <h3 className={styles.title}>Прикрепить к сообщению</h3>

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

        <div className={styles.optionsList}>
          <button
            type="button"
            className={styles.optionRow}
            onClick={() => imageInputRef.current?.click()}
          >
            <div className={`${styles.iconWrap} ${styles.iconPhoto}`}>
              <ImageIcon size={20} />
            </div>
            <div className={styles.optionMeta}>
              <span className={styles.optionName}>Фото или видео</span>
              <span className={styles.optionDesc}>Из медиатеки устройства</span>
            </div>
          </button>

          <button
            type="button"
            className={styles.optionRow}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className={`${styles.iconWrap} ${styles.iconFile}`}>
              <FileText size={20} />
            </div>
            <div className={styles.optionMeta}>
              <span className={styles.optionName}>Документ или файл</span>
              <span className={styles.optionDesc}>Любой формат до 100 МБ</span>
            </div>
          </button>

          <button
            type="button"
            className={styles.optionRow}
            onClick={pickVoiceMock}
          >
            <div className={`${styles.iconWrap} ${styles.iconVoice}`}>
              <Mic size={20} />
            </div>
            <div className={styles.optionMeta}>
              <span className={styles.optionName}>Голосовое сообщение</span>
              <span className={styles.optionDesc}>Запись аудио в чат</span>
            </div>
          </button>
        </div>

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
