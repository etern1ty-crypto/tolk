import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Crop, X } from 'lucide-react';
import { iconProps } from '../../shared/ui/icons';
import styles from './MediaSendPreview.module.css';

type Props = {
  file: File;
  previewUrl: string;
  caption: string;
  onCaption: (v: string) => void;
  onCancel: () => void;
  onSend: (file: File, caption: string) => void | Promise<void>;
  sending?: boolean;
};

/**
 * Fullscreen image send preview with optional square crop + caption.
 * Used for gallery pick and clipboard paste.
 */
export function MediaSendPreview({
  file,
  previewUrl,
  caption,
  onCaption,
  onCancel,
  onSend,
  sending,
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [cropMode, setCropMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!cropMode) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !cropMode) return;
    setOffset({
      x: drag.current.ox + (e.clientX - drag.current.x),
      y: drag.current.oy + (e.clientY - drag.current.y),
    });
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const bakeCrop = useCallback(async (): Promise<File> => {
    if (!cropMode || !imgRef.current) return file;
    const img = imgRef.current;
    const size = 1080;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;

    // Approximate what user sees in the crop square
    const box = img.getBoundingClientRect();
    const natural = { w: img.naturalWidth, h: img.naturalHeight };
    const scale = Math.max(size / natural.w, size / natural.h) * zoom;
    const drawW = natural.w * scale;
    const drawH = natural.h * scale;
    // Map CSS offset (relative to displayed box) into canvas space
    const ratio = size / Math.min(box.width, box.height || 1);
    const dx = size / 2 - drawW / 2 + offset.x * ratio;
    const dy = size / 2 - drawH / 2 + offset.y * ratio;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, dx, dy, drawW, drawH);

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, 'image/jpeg', 0.92)
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '_crop.jpg', {
      type: 'image/jpeg',
    });
  }, [cropMode, file, offset.x, offset.y, zoom]);

  const send = async () => {
    const out = await bakeCrop();
    await onSend(out, caption);
  };

  return (
    <div className={styles.root} role="dialog" aria-label="Превью фото">
      <header className={styles.top}>
        <button type="button" className={styles.iconBtn} onClick={onCancel} aria-label="Отмена">
          <X size={22} strokeWidth={iconProps.strokeWidth} />
        </button>
        <span className={styles.title}>Фото</span>
        <button
          type="button"
          className={`${styles.iconBtn} ${cropMode ? styles.iconActive : ''}`}
          onClick={() => {
            setCropMode((v) => !v);
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
          aria-label="Кадр"
          aria-pressed={cropMode}
        >
          <Crop size={20} strokeWidth={iconProps.strokeWidth} />
        </button>
      </header>

      <div
        className={styles.stage}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={cropMode ? styles.cropFrame : styles.freeFrame}>
          <img
            ref={imgRef}
            src={previewUrl}
            alt=""
            className={styles.img}
            style={
              cropMode
                ? {
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                    cursor: 'grab',
                  }
                : undefined
            }
            draggable={false}
          />
        </div>
        {cropMode && (
          <div className={styles.zoomRow}>
            <span>Масштаб</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
            />
          </div>
        )}
      </div>

      <footer className={styles.bottom}>
        <input
          className={styles.caption}
          value={caption}
          onChange={(e) => onCaption(e.target.value)}
          placeholder="Подпись"
          maxLength={2000}
        />
        <button
          type="button"
          className={styles.send}
          disabled={sending}
          onClick={() => void send()}
        >
          <Check size={20} strokeWidth={2.2} />
          {sending ? '…' : 'Отправить'}
        </button>
      </footer>
    </div>
  );
}
