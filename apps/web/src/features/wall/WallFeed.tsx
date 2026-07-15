import { motion } from 'framer-motion';
import {
  Forward,
  Heart,
  ImagePlus,
  MessageCircle,
  Repeat2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { iconProps } from '../../shared/ui/icons';
import styles from './WallFeed.module.css';

function rel(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
}

export function WallFeed() {
  const posts = useAppStore((s) => s.posts);
  const users = useAppStore((s) => s.users);
  const me = useAppStore((s) => s.me);
  const createPost = useAppStore((s) => s.createPost);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const repostToProfile = useAppStore((s) => s.repostToProfile);
  const setCommentPostId = useAppStore((s) => s.setCommentPostId);
  const setForwardPostId = useAppStore((s) => s.setForwardPostId);
  const openUserProfile = useAppStore((s) => s.openUserProfile);

  const [draft, setDraft] = useState('');
  const [withMedia, setWithMedia] = useState(false);

  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.onWall)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

  const submit = () => {
    if (!draft.trim() && !withMedia) return;
    createPost(draft, { from: 'wall', addToWall: true, withMedia });
    setDraft('');
    setWithMedia(false);
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1>Стена</h1>
        <p className={styles.sub}>посты · рекомендации · без шума</p>
      </header>

      <motion.div
        className={styles.composer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className={styles.composerTop}>
          <Avatar name={me.displayName} size={40} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Расскажите о себе…"
              rows={2}
            />
            <div className={styles.composerRow}>
              <button
                type="button"
                className={withMedia ? styles.mediaOn : styles.mediaBtn}
                onClick={() => setWithMedia((v) => !v)}
              >
                <ImagePlus size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
                Фото
              </button>
              <button
                type="button"
                className={styles.publish}
                disabled={!draft.trim() && !withMedia}
                onClick={submit}
              >
                Опубликовать
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className={styles.list}>
        {feed.length === 0 ? (
          <div className={styles.empty}>Пока тихо. Напишите первый пост.</div>
        ) : (
          feed.map((post, i) => {
            const author = users[post.authorId];
            const liked = post.likedBy.includes(me.id);
            return (
              <motion.article
                key={post.id}
                className={styles.card}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.24) }}
              >
                <header className={styles.cardHead}>
                  <button
                    type="button"
                    className={styles.avatarBtn}
                    onClick={() => openUserProfile(post.authorId)}
                  >
                    <Avatar
                      name={author?.displayName ?? '?'}
                      size={40}
                      online={author?.online}
                    />
                  </button>
                  <div className={styles.meta}>
                    <button
                      type="button"
                      className={styles.name}
                      onClick={() => openUserProfile(post.authorId)}
                    >
                      {author?.displayName ?? '…'}
                    </button>
                    <div className={styles.metaRow}>
                      <time>{rel(post.createdAt)}</time>
                      <span className={styles.badge}>
                        {post.origin === 'profile' ? 'из профиля' : 'в стену'}
                      </span>
                    </div>
                  </div>
                </header>
                {post.media && (
                  <div
                    className={styles.media}
                    style={{ background: post.media.src }}
                    role="img"
                    aria-label={post.media.alt ?? 'медиа'}
                  />
                )}
                {post.text ? <p className={styles.text}>{post.text}</p> : null}
                <footer className={styles.actions}>
                  <button
                    type="button"
                    className={liked ? styles.liked : ''}
                    onClick={() => toggleLike(post.id)}
                  >
                    <Heart
                      size={iconProps.size.sm}
                      fill={liked ? 'currentColor' : 'none'}
                      strokeWidth={iconProps.strokeWidth}
                    />
                    {post.likedBy.length || ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentPostId(post.id)}
                  >
                    <MessageCircle
                      size={iconProps.size.sm}
                      strokeWidth={iconProps.strokeWidth}
                    />
                    {post.comments.length || ''}
                  </button>
                  <button
                    type="button"
                    onClick={() => repostToProfile(post.id)}
                    title="Репост в свой профиль"
                  >
                    <Repeat2
                      size={iconProps.size.sm}
                      strokeWidth={iconProps.strokeWidth}
                    />
                    себе
                  </button>
                  <button
                    type="button"
                    onClick={() => setForwardPostId(post.id)}
                  >
                    <Forward
                      size={iconProps.size.sm}
                      strokeWidth={iconProps.strokeWidth}
                    />
                  </button>
                </footer>
              </motion.article>
            );
          })
        )}
      </div>
    </div>
  );
}
