import { motion, AnimatePresence } from 'framer-motion';
import { ImagePlus, MoreHorizontal, Settings, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BANNER_PATTERNS, useAppStore } from '../../store/appStore';
import { patternById, MEDIA_PATTERNS } from '../../shared/patterns';
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
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Что у вас нового?"
                rows={3}
                autoFocus
              />
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={toWall}
                  onChange={(e) => setToWall(e.target.checked)}
                />
                Добавить в стену
              </label>
              <button
                type="button"
                className={withMedia ? styles.mediaOn : styles.mediaBtn}
                onClick={() => setWithMedia((v) => !v)}
              >
                <ImagePlus size={15} strokeWidth={iconProps.strokeWidth} />
                Медиа-паттерн
              </button>
              <button
                type="button"
                className={styles.publish}
                disabled={!draft.trim() && !withMedia}
                onClick={() => {
                  createPost(draft, {
                    from: 'profile',
                    addToWall: toWall,
                    withMedia,
                  });
                  setDraft('');
                  setWithMedia(false);
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
                ? patternById(MEDIA_PATTERNS, p.media.patternId, MEDIA_PATTERNS[0]!)
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
                  <div className={styles.media} role="img" aria-label={p.media?.alt ?? 'медиа'}>
                    <PatternBg pattern={mediaPat} seed={p.id} density="mid" className={styles.mediaFill} />
                  </div>
                )}
                {p.text ? <p>{p.text}</p> : null}
              </motion.article>
            );
          })
        )}
      </section>
    </div>
  );
}
