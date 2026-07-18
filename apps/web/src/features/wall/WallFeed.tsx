import { motion } from 'framer-motion';
import {
  Forward,
  Heart,
  Link2,
  MessageCircle,
  Repeat2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { copyShareLink } from '../../shared/lib/share';
import { MEDIA_PATTERNS, patternById, generateCustomPattern } from '../../shared/patterns';
import { Avatar } from '../../shared/ui/Avatar';
import { MediaLightbox } from '../../shared/ui/MediaLightbox';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import { PostComposer } from './PostComposer';
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
  const toggleLike = useAppStore((s) => s.toggleLike);
  const repostToProfile = useAppStore((s) => s.repostToProfile);
  const setCommentPostId = useAppStore((s) => s.setCommentPostId);
  const setForwardPostId = useAppStore((s) => s.setForwardPostId);
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const token = useAppStore((s) => s.token);
  const showToast = useAppStore((s) => s.showToast);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.onWall)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1>Стена</h1>
      </header>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <PostComposer from="wall" collapsedPlaceholder="Расскажите о себе…" />
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
                      id={author?.id}
                      avatarUrl={author?.avatarRef}
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
                    </div>
                  </div>
                </header>
                {post.media?.kind === 'pattern' && (() => {
                  const pat = post.media.patternId === 'custom' && post.media.items
                    ? generateCustomPattern(post.media.items.join(' '), post.id)
                    : patternById(MEDIA_PATTERNS, post.media.patternId, MEDIA_PATTERNS[0]!);
                  return (
                    <div
                      className={styles.media}
                      role="img"
                      aria-label={post.media.alt ?? 'медиа'}
                      style={post.media.height ? { height: `${post.media.height}px` } : undefined}
                    >
                      <PatternBg
                        pattern={pat}
                        seed={post.id}
                        density="mid"
                        className={styles.mediaFill}
                      />
                    </div>
                  );
                })()}
                {post.media?.kind === 'image' && post.media?.url && (
                  <button
                    type="button"
                    className={styles.media}
                    style={post.media.height ? { height: `${post.media.height}px` } : undefined}
                    onClick={() => setLightboxSrc(post.media!.url!)}
                    aria-label="Открыть фото"
                  >
                    <img src={post.media.url} alt={post.media.alt ?? 'медиа'} className={styles.mediaFill} style={{ objectFit: 'cover' }} />
                  </button>
                )}
                {post.text ? (
                  <p
                    className={styles.text}
                    style={{
                      fontSize: post.media?.fontSize ? `${post.media.fontSize}px` : undefined,
                      fontFamily: post.media?.fontFamily === 'serif' ? 'serif' : post.media?.fontFamily === 'mono' ? 'monospace' : undefined,
                    }}
                  >
                    {post.text}
                  </p>
                ) : null}
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
                  >
                    <Repeat2
                      size={iconProps.size.sm}
                      strokeWidth={iconProps.strokeWidth}
                    />
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
                  <button
                    type="button"
                    title="Ссылка"
                    onClick={async () => {
                      try {
                        await copyShareLink('post', post.id, token);
                        showToast('Ссылка на пост скопирована');
                      } catch (e: any) {
                        showToast(e.message || 'Ошибка');
                      }
                    }}
                  >
                    <Link2
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
      <MediaLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
