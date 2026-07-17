import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, MoreHorizontal, Settings, X, Paperclip } from 'lucide-react';
import { useMemo, useState, useRef } from 'react';
import { BANNER_PATTERNS, useAppStore } from '../../store/appStore';
import { patternById, MEDIA_PATTERNS, generateCustomPattern } from '../../shared/patterns';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import styles from './ProfileTab.module.css';

function rel(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
}

export function ProfileTab() {
  const me = useAppStore((s) => s.me);
  const posts = useAppStore((s) => s.posts);
  const createPost = useAppStore((s) => s.createPost);
  const deletePost = useAppStore((s) => s.deletePost);
  const setBannerPattern = useAppStore((s) => s.setBannerPattern);
  const updateMe = useAppStore((s) => s.updateMe);
  const openSettings = useAppStore((s) => s.openSettings);

  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<'none' | 'banner' | 'compose'>('none');
  const [draft, setDraft] = useState('');
  const [toWall, setToWall] = useState(true);
  const [withMedia, setWithMedia] = useState(false);
  const [bioEdit, setBioEdit] = useState(false);
  const [bio, setBio] = useState(me.bio ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [patternText, setPatternText] = useState('');
  const [textSize, setTextSize] = useState(16);
  const [textFont, setTextFont] = useState<'sans' | 'serif' | 'mono'>('sans');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setWithMedia(false); // Disable pattern if photo selected
    }
  };

  const [mediaHeight, setMediaHeight] = useState(200);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartY.current = e.clientY;
    dragStartHeight.current = mediaHeight;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const deltaY = e.clientY - dragStartY.current;
    const newHeight = Math.max(120, Math.min(450, dragStartHeight.current + deltaY));
    setMediaHeight(newHeight);
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    dragStartY.current = touch.clientY;
    dragStartHeight.current = mediaHeight;
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const deltaY = touch.clientY - dragStartY.current;
    const newHeight = Math.max(120, Math.min(450, dragStartHeight.current + deltaY));
    setMediaHeight(newHeight);
  };

  const handleTouchEnd = () => {
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setMediaHeight(200);
  };

  const handleTogglePattern = () => {
    setWithMedia((v) => {
      const next = !v;
      if (next) {
        handleRemovePhoto();
      }
      setMediaHeight(200);
      return next;
    });
  };

  const previewPattern = useMemo(() => {
    if (!withMedia) return null;
    return generateCustomPattern(patternText || '✦', 'preview');
  }, [withMedia, patternText]);

  const banner = patternById(BANNER_PATTERNS, me.bannerPatternId);

  const myPosts = useMemo(
    () =>
      posts
        .filter((p) => p.authorId === me.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts, me.id]
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.root}>
      <div className={styles.banner}>
        <PatternBg pattern={banner} seed={me.id} density="high" className={styles.bannerFill} />
        <div className={styles.bannerActions}>
          <div className={styles.menuWrap}>
            <IconBtn
              variant="soft"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Меню профиля"
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X size={18} strokeWidth={iconProps.strokeWidth} />
              ) : (
                <MoreHorizontal size={18} strokeWidth={iconProps.strokeWidth} />
              )}
            </IconBtn>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className={styles.menu}
                  role="menu"
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setPanel('compose');
                      closeMenu();
                    }}
                  >
                    Новый пост
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setPanel('banner');
                      closeMenu();
                    }}
                  >
                    Оформление
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      closeMenu();
                      openSettings();
                    }}
                  >
                    <Settings size={15} strokeWidth={iconProps.strokeWidth} />
                    Настройки
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className={styles.avatarWrap}>
        <Avatar name={me.displayName} size={92} online />
      </div>

      <div className={styles.info}>
        <h1>{me.displayName}</h1>
        <p className={styles.uname}>@{me.username}</p>
        {bioEdit ? (
          <div className={styles.bioEdit}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 140))}
              rows={2}
            />
            <button
              type="button"
              className={styles.saveBio}
              onClick={() => {
                updateMe({ bio: bio.trim() });
                setBioEdit(false);
              }}
            >
              Сохранить
            </button>
          </div>
        ) : (
          <p className={styles.bio}>
            {me.bio || 'Добавьте био'}
            <button
              type="button"
              className={styles.link}
              onClick={() => {
                setBio(me.bio ?? '');
                setBioEdit(true);
              }}
            >
              изменить
            </button>
          </p>
        )}
      </div>

      <AnimatePresence mode="wait">
        {panel === 'banner' && (
          <motion.section
            key="banner"
            className={styles.panel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.panelHead}>
              <h2>Оформление</h2>
              <button type="button" className={styles.panelClose} onClick={() => setPanel('none')}>
                Готово
              </button>
            </div>
            <div className={styles.swatches}>
              {BANNER_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={
                    me.bannerPatternId === p.id ? styles.swatchActive : styles.swatch
                  }
                  onClick={() => setBannerPattern(p.id)}
                  aria-label={p.label}
                  title={p.label}
                >
                  <PatternBg pattern={p} seed={p.id} density="low" className={styles.swatchFill} />
                  <span className={styles.swatchLabel}>{p.label}</span>
                </button>
              ))}
            </div>
          </motion.section>
        )}

        {panel === 'compose' && (
          <motion.section
            key="compose"
            className={styles.panel}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className={styles.panelHead}>
              <h2>Новый пост</h2>
              <button type="button" className={styles.panelClose} onClick={() => setPanel('none')}>
                Закрыть
              </button>
            </div>
            <div className={styles.composeCard}>
              <div style={{ position: 'relative' }}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Что у вас нового?"
                  rows={3}
                  autoFocus
                  style={{ 
                    paddingRight: '40px',
                    fontSize: `${textSize}px`,
                    fontFamily: textFont === 'serif' ? 'serif' : textFont === 'mono' ? 'monospace' : 'inherit',
                    transition: 'font-size 0.15s ease'
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    bottom: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: photoFile ? 'var(--accent)' : 'var(--text-tertiary)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                  }}
                  title="Прикрепить фото"
                >
                  <Paperclip size={18} strokeWidth={iconProps.strokeWidth} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* Text Style Controls */}
              <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Font Size Slider */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '150px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>A</span>
                    <input
                      type="range"
                      min={14}
                      max={32}
                      value={textSize}
                      onChange={(e) => setTextSize(parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{textSize}px</span>
                  </div>

                  {/* Font Family Selector */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {(
                      [
                        ['sans', 'Sans'],
                        ['serif', 'Serif'],
                        ['mono', 'Mono'],
                      ] as const
                    ).map(([font, label]) => (
                      <button
                        key={font}
                        type="button"
                        onClick={() => setTextFont(font)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          background: textFont === font ? 'var(--accent)' : 'transparent',
                          color: textFont === font ? '#fff' : 'var(--text-secondary)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          fontFamily: font === 'serif' ? 'serif' : font === 'mono' ? 'monospace' : 'inherit'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {photoPreview && (
                <div style={{ position: 'relative', margin: '8px 0', borderRadius: '8px', overflow: 'hidden', height: `${mediaHeight}px`, border: '1px solid var(--border-subtle)' }}>
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button 
                    type="button" 
                    onClick={handleRemovePhoto} 
                    style={{ 
                      position: 'absolute', 
                      top: '8px', 
                      right: '8px', 
                      background: 'rgba(0,0,0,0.6)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '24px', 
                      height: '24px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: 'pointer',
                      fontSize: '12px',
                      zIndex: 11
                    }}
                    title="Удалить фото"
                  >
                    ✕
                  </button>
                  <div 
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '24px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'ns-resize',
                      userSelect: 'none',
                      zIndex: 10
                    }}
                  >
                    <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
                  </div>
                </div>
              )}

              {withMedia && (
                <div style={{ margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    value={patternText}
                    onChange={(e) => setPatternText(e.target.value)}
                    placeholder="Текст или эмодзи для паттерна (например: 🔥 или спорт)"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text)',
                      fontSize: '13px'
                    }}
                  />
                  {previewPattern && (
                    <div style={{ height: `${mediaHeight}px`, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                      <PatternBg pattern={previewPattern} seed="preview" density="mid" />
                      <div 
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleTouchStart}
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '24px',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'ns-resize',
                          userSelect: 'none',
                          zIndex: 10
                        }}
                      >
                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={toWall}
                  onChange={(e) => setToWall(e.target.checked)}
                />
                Добавить в стену
              </label>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <button
                  type="button"
                  className={withMedia ? styles.mediaOn : styles.mediaBtn}
                  onClick={handleTogglePattern}
                  disabled={!!photoFile}
                >
                  <ImagePlus size={15} strokeWidth={iconProps.strokeWidth} />
                  Медиа-паттерн
                </button>
              </div>

              <button
                type="button"
                className={styles.publish}
                disabled={!draft.trim() && !withMedia && !photoFile}
                onClick={async () => {
                  await createPost(draft, {
                    from: 'profile',
                    addToWall: toWall,
                    withMedia,
                    photoFile: photoFile ?? undefined,
                    patternText: patternText || undefined,
                    mediaHeight: (photoFile || withMedia) ? mediaHeight : undefined,
                    fontSize: textSize !== 16 ? textSize : undefined,
                    fontFamily: textFont !== 'sans' ? textFont : undefined
                  });
                  setDraft('');
                  setWithMedia(false);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                  setPatternText('');
                  setTextSize(16);
                  setTextFont('sans');
                  setMediaHeight(200);
                  setPanel('none');
                }}
              >
                Опубликовать
              </button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <section className={styles.section}>
        <h2>Посты</h2>
        {myPosts.length === 0 ? (
          <p className={styles.empty}>Пока пусто</p>
        ) : (
          myPosts.map((p, i) => {
            const mediaPat =
              p.media?.kind === 'pattern'
                ? p.media.patternId === 'custom' && p.media.items
                  ? generateCustomPattern(p.media.items.join(' '), p.id)
                  : patternById(MEDIA_PATTERNS, p.media.patternId, MEDIA_PATTERNS[0]!)
                : null;
            return (
              <motion.article
                key={p.id}
                className={styles.post}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.2) }}
              >
                <div className={styles.postTop}>
                  <time>{rel(p.createdAt)}</time>
                  {p.repostOfId && <span className={styles.tag}>репост</span>}
                  <button
                    type="button"
                    onClick={() => deletePost(p.id)}
                    aria-label="Удалить"
                  >
                    ✕
                  </button>
                </div>
                {mediaPat && (
                  <div className={styles.media} role="img" aria-label={p.media?.alt ?? 'медиа'} style={p.media?.height ? { height: `${p.media.height}px` } : undefined}>
                    <PatternBg pattern={mediaPat} seed={p.id} density="mid" className={styles.mediaFill} />
                  </div>
                )}
                {p.media?.kind === 'image' && p.media?.url && (
                  <div className={styles.media} style={p.media.height ? { height: `${p.media.height}px` } : undefined}>
                    <img src={p.media.url} alt={p.media?.alt ?? 'медиа'} className={styles.mediaFill} style={{ objectFit: 'cover' }} />
                  </div>
                )}
                {p.text ? (
                  <p 
                    style={{ 
                      fontSize: p.media?.fontSize ? `${p.media.fontSize}px` : undefined,
                      fontFamily: p.media?.fontFamily === 'serif' ? 'serif' : p.media?.fontFamily === 'mono' ? 'monospace' : undefined,
                      lineHeight: 1.45
                    }}
                  >
                    {p.text}
                  </p>
                ) : null}
              </motion.article>
            );
          })
        )}
      </section>
    </div>
  );
}
