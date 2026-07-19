import { ImagePlus, Link2, MoreHorizontal, Settings, X, Paperclip, Bell } from 'lucide-react';
import { useMemo, useState, useRef, useEffect } from 'react';
import { BANNER_PATTERNS, useAppStore, fetchApi } from '../../store/appStore';
import { copyShareLink } from '../../shared/lib/share';
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
  const updateMe = useAppStore((s) => s.updateMe);
  const openSettings = useAppStore((s) => s.openSettings);
  const token = useAppStore((s) => s.token);

  // Custom Avatar upload and cropping states & logic
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const showToast = useAppStore((s) => s.showToast);

  const notifications = useAppStore((s) => s.notifications);
  const notificationsUnread = useAppStore((s) => s.notificationsUnread);
  const seenNotificationKeys = useAppStore((s) => s.seenNotificationKeys);
  const refreshNotifications = useAppStore((s) => s.refreshNotifications);
  const markNotificationsSeen = useAppStore((s) => s.markNotificationsSeen);
  const clearNotifications = useAppStore((s) => s.clearNotifications);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifKey = (n: any) => `${n.type}-${n.postId}-${n.userId}-${n.createdAt}`;
  const newNotifs = notifications.filter((n) => !seenNotificationKeys.includes(notifKey(n)));
  const seenNotifs = notifications.filter((n) => seenNotificationKeys.includes(notifKey(n)));
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isComposeExpanded, setIsComposeExpanded] = useState(false);

  useEffect(() => {
    if (!token) return;
    void refreshNotifications();
    const interval = setInterval(() => void refreshNotifications(), 8000);
    return () => clearInterval(interval);
  }, [token, refreshNotifications]);

  useEffect(() => {
    if (!croppingImage) {
      imgRef.current = null;
      return;
    }
    const img = new Image();
    img.src = croppingImage;
    img.onload = () => {
      imgRef.current = img;
      drawCanvas();
    };
  }, [croppingImage]);

  useEffect(() => {
    if (imgRef.current) {
      drawCanvas();
    }
  }, [zoom, pan]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const img = imgRef.current;
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;
    const w = img.width * scale;
    const h = img.height * scale;

    const x = (canvas.width - w) / 2 + pan.x;
    const y = (canvas.height - h) / 2 + pan.y;

    ctx.drawImage(img, x, y, w, h);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const uploadAvatar = async (file: File) => {
    const token = useAppStore.getState().token;
    try {
      showToast('Загрузка аватара...');
      let publicUrl = '';
      try {
        const uploadRes = await fetchApi('/media/uploads', {
          method: 'POST',
          body: JSON.stringify({
            mime: file.type || 'image/jpeg',
            size: file.size,
            kind: 'image'
          })
        }, token);

        const s3Res = await fetch(uploadRes.upload_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'image/jpeg',
            Authorization: `Bearer ${token}`,
          }
        });

        if (!s3Res.ok) {
          throw new Error(`S3 upload failed: ${s3Res.statusText}`);
        }

        await fetchApi(`/media/${uploadRes.media_id}/complete`, {
          method: 'POST',
          body: JSON.stringify({})
        }, token);

        publicUrl = uploadRes.public_url;
      } catch (uploadErr) {
        console.error('Avatar upload failed:', uploadErr);
        throw uploadErr;
      }

      await updateMe({ avatarRef: publicUrl });
      showToast('Аватар обновлен!');
    } catch (err: any) {
      console.error('Failed to upload avatar:', err);
      showToast(err.message || 'Ошибка загрузки аватара');
    }
  };

  const handleCrop = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;

    const size = 300;
    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = size;
    cropCanvas.height = size;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return;

    cropCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, size, size);

    cropCanvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'avatar.webp', { type: 'image/webp' });
      setCroppingImage(null);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      await uploadAvatar(file);
    }, 'image/webp', 0.85);
  };

  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

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
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.cancelable) {
      e.preventDefault();
    }
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
        {me.bannerRef ? (
          <img src={me.bannerRef} alt="" className={styles.bannerPhoto} />
        ) : (
          <PatternBg pattern={banner} seed={me.id} density="high" className={styles.bannerFill} />
        )}
        <div className={styles.bannerLeftActions}>
          <div className={styles.menuWrap}>
            <IconBtn
              variant="soft"
              onClick={() => {
                setNotifOpen((v) => !v);
                markNotificationsSeen();
              }}
              aria-label="Уведомления"
              aria-expanded={notifOpen}
            >
              {notifOpen ? (
                <X size={18} strokeWidth={iconProps.strokeWidth} />
              ) : (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={18} strokeWidth={iconProps.strokeWidth} />
                  {notificationsUnread > 0 && (
                    <span className={styles.notifBadge}>
                      {notificationsUnread > 9 ? '9+' : notificationsUnread}
                    </span>
                  )}
                </div>
              )}
            </IconBtn>
            {notifOpen && (
                <div
                  className={styles.menu}
                  style={{ left: 0, right: 'auto', minWidth: '280px', maxHeight: '360px', overflowY: 'auto' }}
                  role="menu"
                >
                  <div className={styles.notifTitleRow}>
                    <div className={styles.notifTitle}>Уведомления</div>
                    <div className={styles.notifTitleActions}>
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          className={styles.notifClear}
                          onClick={() => clearNotifications()}
                        >
                          Очистить
                        </button>
                      )}
                    </div>
                  </div>
                  {notifications.length === 0 ? (
                    <div className={styles.notifEmpty}>Нет уведомлений</div>
                  ) : (
                    <>
                      {newNotifs.length > 0 && (
                        <>
                          <div className={styles.notifSection}>Новые</div>
                          {newNotifs.map((n, idx) => (
                            <button
                              key={`n-${notifKey(n)}-${idx}`}
                              type="button"
                              className={`${styles.notifItem} ${styles.notifItemNew}`}
                              onClick={() => {
                                setSelectedPostId(n.postId);
                                markNotificationsSeen();
                                setNotifOpen(false);
                              }}
                            >
                              <Avatar name={n.displayName} id={n.userId} avatarUrl={n.avatarRef} size={28} />
                              <div className={styles.notifText}>
                                <strong>{n.displayName}</strong>{' '}
                                {n.type === 'like'
                                  ? 'лайк на пост'
                                  : n.type === 'comment_like'
                                    ? 'лайк на комментарий'
                                    : n.type === 'comment_reply'
                                      ? `ответ: «${n.text}»`
                                      : `коммент: «${n.text}»`}
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                      {seenNotifs.length > 0 && (
                        <>
                          <div className={styles.notifSection}>Просмотренные</div>
                          {seenNotifs.map((n, idx) => (
                            <button
                              key={`s-${notifKey(n)}-${idx}`}
                              type="button"
                              className={styles.notifItem}
                              onClick={() => {
                                setSelectedPostId(n.postId);
                                setNotifOpen(false);
                              }}
                            >
                              <Avatar name={n.displayName} id={n.userId} avatarUrl={n.avatarRef} size={28} />
                              <div className={styles.notifText}>
                                <strong>{n.displayName}</strong>{' '}
                                {n.type === 'like'
                                  ? 'лайк на пост'
                                  : n.type === 'comment_like'
                                    ? 'лайк на комментарий'
                                    : n.type === 'comment_reply'
                                      ? `ответ: «${n.text}»`
                                      : `коммент: «${n.text}»`}
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
          </div>
        </div>
        <div className={styles.bannerActions}>
          <IconBtn
            variant="soft"
            aria-label="Поделиться"
            title="Ссылка на профиль"
            onClick={async () => {
              try {
                await copyShareLink('user', me.id, token);
                showToast('Ссылка на профиль скопирована');
              } catch (e: any) {
                showToast(e.message || 'Ошибка ссылки');
              }
            }}
          >
            <Link2 size={18} strokeWidth={iconProps.strokeWidth} />
          </IconBtn>
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
            {menuOpen && (
                <div
                  className={styles.menu}
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setIsComposeExpanded(true);
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
                </div>
              )}
          </div>
        </div>
      </div>

      <div className={styles.avatarWrapEditable} onClick={triggerAvatarUpload} title="Сменить аватар">
        <div className={styles.avatarInnerWrap}>
          <Avatar name={me.displayName} id={me.id} avatarUrl={me.avatarRef} size={92} online />
          <div className={styles.avatarHoverOverlay}>
            <span>📷</span>
          </div>
        </div>
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

      {panel === 'banner' && (
          <section
            key="banner"
            className={styles.panel}
          >
            <div className={styles.panelHead}>
              <h2>Оформление</h2>
              <button type="button" className={styles.panelClose} onClick={() => setPanel('none')}>
                Готово
              </button>
            </div>
            <div className={styles.bannerUploadRow}>
              <button
                type="button"
                className={styles.bannerUploadBtn}
                onClick={() => bannerInputRef.current?.click()}
              >
                <ImagePlus size={16} /> Фото на фон
              </button>
              {me.bannerRef && (
                <button
                  type="button"
                  className={styles.bannerUploadBtn}
                  onClick={() => void updateMe({ bannerRef: null as any })}
                >
                  Убрать фото
                </button>
              )}
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (!file) return;
                  try {
                    showToast('Загрузка фона…');
                    const uploadRes = await fetchApi(
                      '/media/uploads',
                      {
                        method: 'POST',
                        body: JSON.stringify({
                          mime: file.type || 'image/jpeg',
                          size: file.size,
                          kind: 'image',
                        }),
                      },
                      token
                    );
                    const put = await fetch(uploadRes.upload_url, {
                      method: 'PUT',
                      body: file,
                      headers: {
                        'Content-Type': file.type || 'image/jpeg',
                        Authorization: `Bearer ${token}`,
                      },
                    });
                    if (!put.ok) throw new Error('upload failed');
                    await fetchApi(`/media/${uploadRes.media_id}/complete`, { method: 'POST' }, token);
                    await updateMe({ bannerRef: uploadRes.public_url });
                    showToast('Фон обновлён');
                  } catch (err: any) {
                    showToast(err.message || 'Ошибка загрузки фона');
                  }
                }}
              />
            </div>
            <p className={styles.bannerHint}>или паттерн:</p>
            <div className={styles.swatches}>
              {BANNER_PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={
                    !me.bannerRef && me.bannerPatternId === p.id
                      ? styles.swatchActive
                      : styles.swatch
                  }
                  onClick={() => {
                    void updateMe({ bannerRef: null as any, bannerPatternId: p.id });
                  }}
                  aria-label={p.label}
                  title={p.label}
                >
                  <PatternBg pattern={p} seed={p.id} density="low" className={styles.swatchFill} />
                  <span className={styles.swatchLabel}>{p.label}</span>
                </button>
              ))}
            </div>
          </section>
        )}

      <section className={styles.section}>
        <div className={styles.composerWrap}>
          {!isComposeExpanded ? (
            <div className={styles.collapsedComposer} onClick={() => setIsComposeExpanded(true)}>
              <Avatar name={me.displayName} id={me.id} avatarUrl={me.avatarRef} size={32} />
              <input type="text" placeholder="Что у вас нового?" readOnly />
            </div>
          ) : (
            <div
              className={styles.composeCard}
            >
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
                      touchAction: 'none',
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
                          touchAction: 'none',
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

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className={styles.cancelCompose}
                  onClick={() => {
                    setDraft('');
                    setWithMedia(false);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                    setPatternText('');
                    setTextSize(16);
                    setTextFont('sans');
                    setMediaHeight(200);
                    setIsComposeExpanded(false);
                  }}
                >
                  Отмена
                </button>
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
                    setIsComposeExpanded(false);
                  }}
                >
                  Опубликовать
                </button>
              </div>
            </div>
          )}
        </div>

        <h2>Посты</h2>
        {myPosts.length === 0 ? (
          <p className={styles.empty}>Пока пусто</p>
        ) : (
          <div className={styles.postsGrid}>
          {myPosts.map((p) => {
            const mediaPat =
              p.media?.kind === 'pattern'
                ? p.media.patternId === 'custom' && p.media.items
                  ? generateCustomPattern(p.media.items.join(' '), p.id)
                  : patternById(MEDIA_PATTERNS, p.media.patternId, MEDIA_PATTERNS[0]!)
                : null;
            return (
              <article
                key={p.id}
                className={styles.post}
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
              </article>
            );
          })}
          </div>
        )}
      </section>

      <input
        type="file"
        ref={avatarInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              setCroppingImage(reader.result as string);
            };
            reader.readAsDataURL(file);
          }
        }}
        accept="image/*"
        style={{ display: 'none' }}
      />

      {croppingImage && (
        <div className={styles.cropperOverlay}>
          <div className={styles.cropperPanel}>
            <h3 className={styles.cropperTitle}>Кадрирование аватара</h3>
            
            <div
              className={styles.canvasContainer}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <canvas
                ref={canvasRef}
                width={280}
                height={280}
                className={styles.cropperCanvas}
              />
              <div className={styles.cropperCircleMask} />
            </div>

            <div className={styles.cropperControls}>
              <div className={styles.cropperRow}>
                <span>Масштаб</span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.cropperSlider}
              />
            </div>

            <div className={styles.cropperActions}>
              <button
                type="button"
                className={styles.btnCancel}
                onClick={() => setCroppingImage(null)}
              >
                Отмена
              </button>
              <button
                type="button"
                className={styles.btnCrop}
                onClick={handleCrop}
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPostId && (
          (() => {
            const selectedPost = posts.find((p) => p.id === selectedPostId);
            if (!selectedPost) return null;
            const mediaPat =
              selectedPost.media?.kind === 'pattern'
                ? selectedPost.media.patternId === 'custom' && selectedPost.media.items
                  ? generateCustomPattern(selectedPost.media.items.join(' '), selectedPost.id)
                  : patternById(MEDIA_PATTERNS, selectedPost.media.patternId, MEDIA_PATTERNS[0]!)
                : null;
            return (
              <div
                className={styles.modalOverlay}
                onClick={() => setSelectedPostId(null)}
              >
                <div
                  className={styles.modalContent}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={styles.modalHeader}>
                    <h3>Пост</h3>
                    <IconBtn onClick={() => setSelectedPostId(null)}>
                      <X size={18} />
                    </IconBtn>
                  </div>
                  <div className={styles.modalBody}>
                    <article className={styles.post} style={{ margin: 0 }}>
                      <div className={styles.postTop}>
                        <time>{rel(selectedPost.createdAt)}</time>
                      </div>
                      {mediaPat && (
                        <div className={styles.media} style={selectedPost.media?.height ? { height: `${selectedPost.media.height}px` } : undefined}>
                          <PatternBg pattern={mediaPat} seed={selectedPost.id} density="mid" className={styles.mediaFill} />
                        </div>
                      )}
                      {selectedPost.media?.kind === 'image' && selectedPost.media?.url && (
                        <div className={styles.media} style={selectedPost.media.height ? { height: `${selectedPost.media.height}px` } : undefined}>
                          <img src={selectedPost.media.url} alt="media" className={styles.mediaFill} style={{ objectFit: 'cover' }} />
                        </div>
                      )}
                      {selectedPost.text && (
                        <p
                          style={{
                            fontSize: selectedPost.media?.fontSize ? `${selectedPost.media.fontSize}px` : undefined,
                            fontFamily: selectedPost.media?.fontFamily === 'serif' ? 'serif' : selectedPost.media?.fontFamily === 'mono' ? 'monospace' : undefined,
                            lineHeight: 1.45
                          }}
                        >
                          {selectedPost.text}
                        </p>
                      )}
                    </article>

                    <div className={styles.commentsSection}>
                      <h4>Комментарии</h4>
                      {selectedPost.comments && selectedPost.comments.length > 0 ? (
                        <div className={styles.commentsList}>
                          {selectedPost.comments.map((c: any) => {
                            const commentUser = useAppStore.getState().users[c.userId] || { displayName: 'Пользователь' };
                            return (
                              <div key={c.id} className={styles.commentItem}>
                                <Avatar name={commentUser.displayName} id={c.userId} avatarUrl={commentUser.avatarRef} size={24} />
                                <div className={styles.commentTextWrap}>
                                  <div className={styles.commentAuthor}>{commentUser.displayName}</div>
                                  <div className={styles.commentText}>{c.text}</div>
                                  <div className={styles.commentTime}>{rel(c.createdAt)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={styles.emptyComments}>Нет комментариев</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )}
    </div>
  );
}
