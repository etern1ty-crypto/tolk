import { ImagePlus, Paperclip, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { generateCustomPattern } from '../../shared/patterns';
import { Avatar } from '../../shared/ui/Avatar';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import styles from './PostComposer.module.css';

type Props = {
  from: 'wall' | 'profile';
  /** Profile can opt out of wall; wall always true */
  defaultToWall?: boolean;
  showWallToggle?: boolean;
  collapsedPlaceholder?: string;
};

export function PostComposer({
  from,
  defaultToWall = true,
  showWallToggle = false,
  collapsedPlaceholder = 'Что у вас нового?',
}: Props) {
  const me = useAppStore((s) => s.me);
  const createPost = useAppStore((s) => s.createPost);

  const [expanded, setExpanded] = useState(from === 'wall');
  const [draft, setDraft] = useState('');
  const [toWall, setToWall] = useState(defaultToWall);
  const [withMedia, setWithMedia] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [patternText, setPatternText] = useState('');
  const [textSize, setTextSize] = useState(16);
  const [textFont, setTextFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [mediaHeight, setMediaHeight] = useState(200);
  const [busy, setBusy] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const previewPattern = useMemo(() => {
    if (!withMedia) return null;
    return generateCustomPattern(patternText || '✦', 'preview');
  }, [withMedia, patternText]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setWithMedia(false);
  };

  const removePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onResizeStart = (clientY: number) => {
    dragStartY.current = clientY;
    dragStartHeight.current = mediaHeight;
  };

  const onResizeMove = (clientY: number) => {
    const deltaY = clientY - dragStartY.current;
    setMediaHeight(Math.max(120, Math.min(450, dragStartHeight.current + deltaY)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onResizeStart(e.clientY);
    const move = (ev: MouseEvent) => onResizeMove(ev.clientY);
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    onResizeStart(touch.clientY);
    const move = (ev: TouchEvent) => {
      const t = ev.touches[0];
      if (!t) return;
      ev.preventDefault();
      onResizeMove(t.clientY);
    };
    const up = () => {
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
    };
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
  };

  const reset = () => {
    setDraft('');
    setWithMedia(false);
    removePhoto();
    setPatternText('');
    setTextSize(16);
    setTextFont('sans');
    setMediaHeight(200);
    setToWall(defaultToWall);
    if (from === 'profile') setExpanded(false);
  };

  const canPublish = !!(draft.trim() || withMedia || photoFile);

  const publish = async () => {
    if (!canPublish || busy) return;
    setBusy(true);
    try {
      await createPost(draft, {
        from,
        addToWall: from === 'wall' ? true : toWall,
        withMedia,
        photoFile: photoFile ?? undefined,
        patternText: patternText || undefined,
        mediaHeight: photoFile || withMedia ? mediaHeight : undefined,
        fontSize: textSize !== 16 ? textSize : undefined,
        fontFamily: textFont !== 'sans' ? textFont : undefined,
      });
      reset();
    } finally {
      setBusy(false);
    }
  };

  if (!expanded) {
    return (
      <button type="button" className={styles.collapsed} onClick={() => setExpanded(true)}>
        <Avatar name={me.displayName} id={me.id} avatarUrl={me.avatarRef} size={36} />
        <span>{collapsedPlaceholder}</span>
      </button>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <Avatar name={me.displayName} id={me.id} avatarUrl={me.avatarRef} size={40} />
        <div className={styles.body}>
          <div className={styles.textareaWrap}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={collapsedPlaceholder}
              rows={3}
              autoFocus
              style={{
                fontSize: `${textSize}px`,
                fontFamily:
                  textFont === 'serif' ? 'serif' : textFont === 'mono' ? 'monospace' : 'inherit',
              }}
            />
            <button
              type="button"
              className={styles.attachBtn}
              onClick={() => fileInputRef.current?.click()}
              title="Прикрепить фото"
            >
              <Paperclip size={18} strokeWidth={iconProps.strokeWidth} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handlePhotoChange}
            />
          </div>

          <div className={styles.tools}>
            <div className={styles.fontSize}>
              <span>A</span>
              <input
                type="range"
                min={14}
                max={32}
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value, 10))}
              />
              <span>{textSize}px</span>
            </div>
            <div className={styles.fonts}>
              {(['sans', 'serif', 'mono'] as const).map((font) => (
                <button
                  key={font}
                  type="button"
                  className={textFont === font ? styles.fontActive : styles.fontBtn}
                  onClick={() => setTextFont(font)}
                  style={{
                    fontFamily: font === 'serif' ? 'serif' : font === 'mono' ? 'monospace' : 'inherit',
                  }}
                >
                  {font === 'sans' ? 'Sans' : font === 'serif' ? 'Serif' : 'Mono'}
                </button>
              ))}
            </div>
          </div>

          {photoPreview && (
            <div className={styles.mediaBox} style={{ height: mediaHeight }}>
              <img src={photoPreview} alt="Превью" />
              <button type="button" className={styles.removeMedia} onClick={removePhoto} aria-label="Убрать фото">
                <X size={12} />
              </button>
              <div
                className={styles.resizeHandle}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
              >
                <i />
              </div>
            </div>
          )}

          {withMedia && previewPattern && (
            <div className={styles.patternBlock}>
              <input
                type="text"
                value={patternText}
                onChange={(e) => setPatternText(e.target.value)}
                placeholder="Текст или эмодзи для паттерна"
                className={styles.patternInput}
              />
              <div className={styles.mediaBox} style={{ height: mediaHeight }}>
                <PatternBg pattern={previewPattern} seed="preview" density="mid" className={styles.patternFill} />
                <div
                  className={styles.resizeHandle}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <i />
                </div>
              </div>
            </div>
          )}

          {showWallToggle && (
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={toWall}
                onChange={(e) => setToWall(e.target.checked)}
              />
              Добавить в стену
            </label>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={withMedia ? styles.mediaOn : styles.mediaBtn}
              onClick={() => {
                setWithMedia((v) => !v);
                if (!withMedia) removePhoto();
              }}
              disabled={!!photoFile}
            >
              <ImagePlus size={15} strokeWidth={iconProps.strokeWidth} />
              Паттерн
            </button>
            <div className={styles.actionRight}>
              <button type="button" className={styles.cancel} onClick={reset}>
                Отмена
              </button>
              <button
                type="button"
                className={styles.publish}
                disabled={!canPublish || busy}
                onClick={() => void publish()}
              >
                {busy ? '…' : 'Опубликовать'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
