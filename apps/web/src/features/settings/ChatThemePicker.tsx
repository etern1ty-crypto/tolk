import { Upload } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { CHAT_THEMES, resolveChatThemeId } from '../../shared/patterns';
import { PatternBg } from '../../shared/ui/PatternBg';
import { fetchApi, useAppStore } from '../../store/appStore';
import { iconProps } from '../../shared/ui/icons';
import styles from './ChatThemePicker.module.css';

type Props = {
  /** Selected theme id (chat or global) */
  value?: string | null;
  onSelect: (themeId: string) => void;
  /** Show “Своё” custom wallpaper upload */
  allowCustom?: boolean;
  /** Compact row for in-chat bar */
  compact?: boolean;
};

/**
 * Shared monochrome chat wallpaper picker — settings + in-chat theme bar.
 */
export function ChatThemePicker({
  value,
  onSelect,
  allowCustom = false,
  compact = false,
}: Props) {
  const globalCustomWallpaper = useAppStore((s) => s.globalCustomWallpaper);
  const setGlobalCustomWallpaper = useAppStore((s) => s.setGlobalCustomWallpaper);
  const showToast = useAppStore((s) => s.showToast);
  const active = resolveChatThemeId(value ?? undefined);
  const customActive = allowCustom && !!globalCustomWallpaper;

  const pickTheme = (themeId: string) => {
    if (allowCustom && globalCustomWallpaper) {
      setGlobalCustomWallpaper(null);
    }
    onSelect(themeId);
  };

  const uploadCustom = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1920,
          fileType: 'image/webp',
          initialQuality: 0.8,
        });
        const token = useAppStore.getState().token;
        const uploadRes = await fetchApi(
          '/media/uploads',
          {
            method: 'POST',
            body: JSON.stringify({
              mime: 'image/webp',
              size: compressed.size,
              kind: 'image',
            }),
          },
          token
        );
        await fetch(uploadRes.upload_url, {
          method: 'PUT',
          body: compressed,
          headers: { 'Content-Type': 'image/webp' },
        });
        await fetchApi(`/media/${uploadRes.media_id}/complete`, { method: 'POST' }, token);
        setGlobalCustomWallpaper(uploadRes.public_url);
      } catch {
        showToast('Ошибка загрузки обоев');
      }
    };
    input.click();
  };

  return (
    <div className={compact ? styles.row : styles.grid} role="listbox" aria-label="Фон чата">
      {CHAT_THEMES.map((theme) => {
        const selected = !customActive && active === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            role="option"
            aria-selected={selected}
            className={selected ? styles.cardActive : styles.card}
            onClick={() => pickTheme(theme.id)}
            title={theme.label}
          >
            <PatternBg
              pattern={theme}
              seed={theme.id}
              density="low"
              className={styles.preview}
            />
            <span className={styles.label}>{theme.label}</span>
          </button>
        );
      })}
      {allowCustom && (
        <button
          type="button"
          role="option"
          aria-selected={customActive}
          className={customActive ? styles.cardActive : styles.card}
          onClick={uploadCustom}
          title="Своё фото"
        >
          <div className={styles.customSlot}>
            {globalCustomWallpaper ? (
              <img src={globalCustomWallpaper} alt="" className={styles.customImg} />
            ) : (
              <Upload size={iconProps.size.md} strokeWidth={iconProps.strokeWidth} />
            )}
          </div>
          <span className={styles.label}>Своё</span>
        </button>
      )}
    </div>
  );
}
