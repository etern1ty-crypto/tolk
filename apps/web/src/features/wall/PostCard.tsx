import { Forward, Heart, Link2, MessageCircle, Repeat2 } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { useAppStore } from '../../store/appStore';
import type { Post } from '../../shared/types';
import { copyShareLink } from '../../shared/lib/share';
import { clamp, createSpring, prefersReducedMotion } from '../../shared/lib/motion';
import { triggerHaptic } from '../../shared/lib/haptics';
import { MEDIA_PATTERNS, patternById, generateCustomPattern } from '../../shared/patterns';
import { VerifiedBadge } from '../../shared/ui/VerifiedBadge';
import { Avatar } from '../../shared/ui/Avatar';
import { PostImage } from '../../shared/ui/PostImage';
import { PatternBg } from '../../shared/ui/PatternBg';
import styles from './PostCard.module.css';

function relativeTime(ts: number) {
  const minutes = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (!minutes) return 'сейчас';
  if (minutes < 60) return `${minutes} мин`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} ч`;
  return `${Math.floor(minutes / 1440)} д`;
}
type Tap = { x: number; y: number; time: number; id: number };

export function PostCard({
  post,
  onOpenImage,
}: {
  post: Post;
  onOpenImage: (src: string) => void;
}) {
  const author = useAppStore((s) => s.users[post.authorId]);
  const meId = useAppStore((s) => s.me.id);
  const verified = useAppStore((s) => s.verifiedUsers.includes(post.authorId));
  const openUserProfile = useAppStore((s) => s.openUserProfile);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const repost = useAppStore((s) => s.repostToProfile);
  const comment = useAppStore((s) => s.setCommentPostId);
  const forward = useAppStore((s) => s.setForwardPostId);
  const liked = post.likedBy.includes(meId);
  const start = useRef<Tap | null>(null);
  const lastTap = useRef<Tap | null>(null);
  const touchClick = useRef(false);
  const suppressImageClick = useRef(false);
  const imageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number; key: number } | null>(null);
  const heartRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () => () => {
      if (imageTimer.current !== null) clearTimeout(imageTimer.current);
    },
    [],
  );
  useLayoutEffect(() => {
    const el = heartRef.current;
    if (!burst || !el) return;
    const reduced = prefersReducedMotion();
    const spring = createSpring(reduced ? 1 : 0.6, (value) => {
      el.style.transform = `scale(${value}) rotate(${(1 - value) * 10}deg)`;
    });
    spring.set(reduced ? 1 : 0.6);
    if (!reduced)
      spring.to(1.32, {
        damping: 0.8,
        response: 0.35,
        onRest: () => spring.to(1, { damping: 0.8, response: 0.35 }),
      });
    const opacity = el.animate(
      [{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }],
      { duration: reduced ? 180 : 850, fill: 'both' },
    );
    const timer = setTimeout(() => setBurst(null), reduced ? 190 : 860);
    return () => {
      spring.stop();
      opacity.cancel();
      clearTimeout(timer);
    };
  }, [burst]);

  const down = (e: PointerEvent<HTMLElement>) => {
    touchClick.current = e.pointerType === 'touch';
    if (e.pointerType !== 'touch' || !e.isPrimary || e.button !== 0) return;
    if ((e.target as HTMLElement).closest('a, input, textarea, button:not([data-post-media])'))
      return;
    start.current = { x: e.clientX, y: e.clientY, time: e.timeStamp, id: e.pointerId };
  };
  const up = (e: PointerEvent<HTMLElement>) => {
    const tap = start.current;
    start.current = null;
    if (
      !tap ||
      tap.id !== e.pointerId ||
      e.timeStamp - tap.time > 350 ||
      Math.hypot(e.clientX - tap.x, e.clientY - tap.y) >= 24
    )
      return;
    const last = lastTap.current;
    if (
      last &&
      e.timeStamp - last.time < 280 &&
      Math.hypot(e.clientX - last.x, e.clientY - last.y) < 24
    ) {
      lastTap.current = null;
      suppressImageClick.current = true;
      if (imageTimer.current !== null) clearTimeout(imageTimer.current);
      const current = useAppStore.getState().posts.find((p) => p.id === post.id);
      if (current && !current.likedBy.includes(meId)) void toggleLike(post.id);
      const box = e.currentTarget.getBoundingClientRect();
      setBurst({
        x: clamp(e.clientX - box.left, 48, box.width - 48),
        y: clamp(e.clientY - box.top, 48, box.height - 48),
        key: e.timeStamp,
      });
      triggerHaptic('impactLight');
    } else {
      suppressImageClick.current = false;
      lastTap.current = { ...tap, time: e.timeStamp };
    }
  };
  const name = author?.displayName ?? 'Пользователь';
  const pattern =
    post.media?.kind === 'pattern'
      ? post.media.patternId === 'custom' && post.media.items
        ? generateCustomPattern(post.media.items.join(' '), post.id)
        : patternById(MEDIA_PATTERNS, post.media.patternId, MEDIA_PATTERNS[0]!)
      : null;
  const mediaStyle = post.media?.height
    ? { maxHeight: clamp(post.media.height, 160, 640) }
    : undefined;

  return (
    <article
      className={styles.card}
      aria-label={`Пост: ${name}`}
      data-post-id={post.id}
      onPointerDown={down}
      onPointerUp={up}
      onPointerMove={(e) => {
        const tap = start.current;
        if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) >= 24) {
          start.current = null;
          lastTap.current = null;
        }
      }}
      onPointerCancel={() => {
        start.current = null;
        lastTap.current = null;
      }}
    >
      <header className={styles.head}>
        <button
          type="button"
          className={styles.avatar}
          onClick={() => void openUserProfile(post.authorId)}
          aria-label={`Профиль: ${name}`}
        >
          <Avatar
            name={name}
            id={post.authorId}
            avatarUrl={author?.avatarRef}
            size={40}
            online={author?.online}
          />
        </button>
        <div className={styles.meta}>
          <button
            type="button"
            className={styles.name}
            onClick={() => void openUserProfile(post.authorId)}
          >
            <span>
              {name}
              {(author?.verified || verified) && <VerifiedBadge size="sm" />}
            </span>
            <time dateTime={new Date(post.createdAt).toISOString()}>
              {relativeTime(post.createdAt)}
            </time>
          </button>
        </div>
      </header>
      {pattern && (
        <div
          className={styles.media}
          style={mediaStyle}
          role="img"
          aria-label={post.media?.alt ?? 'Обложка поста'}
        >
          <PatternBg pattern={pattern} seed={post.id} density="mid" className={styles.mediaFill} />
        </div>
      )}
      {post.media?.kind === 'image' && post.media.url && (
        <button
          type="button"
          data-post-media
          className={styles.media}
          style={mediaStyle}
          aria-label="Открыть фото"
          onClick={(e) => {
            if (suppressImageClick.current) {
              suppressImageClick.current = false;
              return;
            }
            const url = post.media?.url;
            if (!url) return;
            if (!touchClick.current || e.detail === 0) {
              onOpenImage(url);
              return;
            }
            if (imageTimer.current !== null) clearTimeout(imageTimer.current);
            imageTimer.current = setTimeout(() => onOpenImage(url), 285);
          }}
        >
          <PostImage
            src={post.media.url}
            alt={post.media.alt ?? 'Фото в посте'}
            className={styles.mediaFill}
          />
        </button>
      )}
      {post.text && (
        <p
          className={styles.text}
          style={{
            fontSize: post.media?.fontSize ? clamp(post.media.fontSize, 16, 40) : undefined,
            fontFamily:
              post.media?.fontFamily === 'serif'
                ? 'Georgia, serif'
                : post.media?.fontFamily === 'mono'
                  ? 'ui-monospace, monospace'
                  : undefined,
          }}
        >
          {post.text}
        </p>
      )}
      <footer className={styles.actions}>
        <button
          type="button"
          aria-label={liked ? 'Убрать отметку «нравится»' : 'Нравится'}
          aria-pressed={liked}
          onClick={() => void toggleLike(post.id)}
        >
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
          <span>{post.likedBy.length || ''}</span>
        </button>
        <button type="button" aria-label="Комментарии" onClick={() => comment(post.id)}>
          <MessageCircle size={20} />
          <span>{post.comments.length || ''}</span>
        </button>
        <button type="button" aria-label="Опубликовать у себя" onClick={() => void repost(post.id)}>
          <Repeat2 size={20} />
        </button>
        <button type="button" aria-label="Переслать в чат" onClick={() => forward(post.id)}>
          <Forward size={20} />
        </button>
        <button
          type="button"
          aria-label="Скопировать ссылку на пост"
          onClick={async () => {
            const state = useAppStore.getState();
            try {
              await copyShareLink('post', post.id, state.token);
              state.showToast('Ссылка на пост скопирована');
            } catch {
              state.showToast('Не удалось скопировать ссылку');
            }
          }}
        >
          <Link2 size={20} />
        </button>
      </footer>
      {burst && (
        <span
          key={burst.key}
          className={styles.burst}
          style={{ left: burst.x, top: burst.y }}
          aria-hidden="true"
        >
          <span ref={heartRef} className={styles.heart}>
            <Heart size={72} fill="currentColor" strokeWidth={1.5} />
          </span>
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className={styles.ray} style={{ transform: `rotate(${i * 60}deg)` }}>
              <i />
            </span>
          ))}
        </span>
      )}
    </article>
  );
}
