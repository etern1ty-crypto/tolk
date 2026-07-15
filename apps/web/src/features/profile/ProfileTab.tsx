import { motion } from 'framer-motion';
import { ImagePlus, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BANNERS, useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { IconBtn } from '../../shared/ui/IconBtn';
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
  const setBanner = useAppStore((s) => s.setBanner);
  const updateMe = useAppStore((s) => s.updateMe);
  const openSettings = useAppStore((s) => s.openSettings);

  const [draft, setDraft] = useState('');
  const [toWall, setToWall] = useState(true);
  const [withMedia, setWithMedia] = useState(false);
  const [bioEdit, setBioEdit] = useState(false);
  const [bio, setBio] = useState(me.bio ?? '');

  const myPosts = useMemo(
    () =>
      posts
        .filter((p) => p.authorId === me.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts, me.id]
  );

  return (
    <div className={styles.root}>
      <div className={styles.banner} style={{ background: me.banner }}>
        <div className={styles.bannerOverlay} />
        <div className={styles.bannerActions}>
          <IconBtn variant="soft" onClick={openSettings} aria-label="Настройки">
            <Settings size={18} />
          </IconBtn>
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

      <section className={styles.section}>
        <h2>Оформление</h2>
        <div className={styles.swatches}>
          {Object.entries(BANNERS).map(([key, value]) => (
            <button
              key={key}
              type="button"
              className={
                me.banner === value ? styles.swatchActive : styles.swatch
              }
              style={{ background: value }}
              onClick={() => setBanner(value)}
              aria-label={`Фон ${key}`}
            />
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2>Новый пост</h2>
        <div className={styles.composeCard}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Что у вас нового?"
            rows={3}
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
            <ImagePlus size={15} />
            Фото
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
            }}
          >
            Опубликовать
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Мои посты</h2>
        {myPosts.length === 0 ? (
          <p className={styles.empty}>Пока пусто — напишите первый пост.</p>
        ) : (
          myPosts.map((p, i) => (
            <motion.article
              key={p.id}
              className={styles.post}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.2) }}
            >
              <div className={styles.postTop}>
                <time>{rel(p.createdAt)}</time>
                <span className={styles.tag}>
                  {p.repostOfId
                    ? 'репост'
                    : p.onWall
                      ? 'профиль + стена'
                      : 'только профиль'}
                </span>
                <button
                  type="button"
                  onClick={() => deletePost(p.id)}
                  aria-label="Удалить"
                >
                  ✕
                </button>
              </div>
              {p.media && (
                <div
                  className={styles.media}
                  style={{ background: p.media.src }}
                  role="img"
                  aria-label={p.media.alt ?? 'медиа'}
                />
              )}
              {p.text ? <p>{p.text}</p> : null}
            </motion.article>
          ))
        )}
      </section>
    </div>
  );
}
