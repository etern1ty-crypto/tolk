import {
  ChevronLeft,
  ChevronRight,
  Forward,
  Heart,
  Link2,
  MessageCircle,
  Repeat2,
  Sparkles,
} from 'lucide-react';
import { useRef, useState, useMemo } from 'react';
import type { WheelEvent, TouchEvent } from 'react';
import { useAppStore } from '../../store/appStore';
import { copyShareLink } from '../../shared/lib/share';
import { MEDIA_PATTERNS, patternById, generateCustomPattern } from '../../shared/patterns';
import { Avatar } from '../../shared/ui/Avatar';
import { MediaLightbox } from '../../shared/ui/MediaLightbox';
import { PatternBg } from '../../shared/ui/PatternBg';
import { iconProps } from '../../shared/ui/icons';
import { PostComposer } from './PostComposer';
import styles from './WallFeed.module.css';
import { SkeletonList } from '../../shared/ui/Skeleton';
import { PostImage } from '../../shared/ui/PostImage';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';

function rel(ts: number) {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return 'сейчас';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч`;
  return `${Math.floor(h / 24)} д`;
}

const MOBILE_PORTION_SIZE = 2;

export function WallFeed() {
  const isDesktop = useIsDesktop();
  const booting = useAppStore((s) => s.booting);
  const feedHasMore = useAppStore((s) => s.feedHasMore);
  const loadMoreFeed = useAppStore((s) => s.loadMoreFeed);
  
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

  // Desktop horizontal wheel scroll offset
  const [scrollX, setScrollX] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // Mobile swipe portion state
  const [portionIndex, setPortionIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [animatingPortion, setAnimatingPortion] = useState(false);

  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.onWall)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

  // Split feed into portions of 2 posts for mobile view
  const mobilePortions = useMemo(() => {
    const chunks: (typeof feed)[] = [];
    for (let i = 0; i < feed.length; i += MOBILE_PORTION_SIZE) {
      chunks.push(feed.slice(i, i + MOBILE_PORTION_SIZE));
    }
    return chunks;
  }, [feed]);

  const maxPortion = Math.max(0, mobilePortions.length - 1);

  // Handle desktop mouse wheel horizontal scrolling
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 2) return;
    
    setScrollX((prev) => {
      const maxScroll = Math.max(0, (feed.length - 1) * 440);
      const next = prev + delta * 1.1;
      return Math.max(0, Math.min(maxScroll, next));
    });
  };

  const handlePrevDesktop = () => {
    setScrollX((prev) => Math.max(0, prev - 440));
  };

  const handleNextDesktop = () => {
    const maxScroll = Math.max(0, (feed.length - 1) * 440);
    setScrollX((prev) => Math.min(maxScroll, prev + 440));
  };

  // Mobile swipe touch handlers
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isDesktop || e.touches.length === 0) return;
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isDesktop || touchStartX === null || e.touches.length === 0) return;
    const delta = e.touches[0].clientX - touchStartX;
    setTouchDeltaX(delta);
  };

  const handleTouchEnd = () => {
    if (isDesktop || touchStartX === null) return;
    if (touchDeltaX < -60 && portionIndex < maxPortion) {
      triggerNextPortion();
    } else if (touchDeltaX > 60 && portionIndex > 0) {
      triggerPrevPortion();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const triggerNextPortion = () => {
    if (portionIndex >= maxPortion) {
      if (feedHasMore) {
        void loadMoreFeed();
      }
      return;
    }
    setAnimatingPortion(true);
    setPortionIndex((p) => Math.min(maxPortion, p + 1));
    setTimeout(() => setAnimatingPortion(false), 300);
  };

  const triggerPrevPortion = () => {
    if (portionIndex <= 0) return;
    setAnimatingPortion(true);
    setPortionIndex((p) => Math.max(0, p - 1));
    setTimeout(() => setAnimatingPortion(false), 300);
  };

  const renderPostCard = (post: typeof feed[0], index: number) => {
    const author = users[post.authorId];
    const liked = post.likedBy.includes(me.id);

    // Desktop 3D depth transform based on distance from focus
    let cardStyle: React.CSSProperties = {};
    if (isDesktop) {
      const cardCenter = index * 440;
      const dist = Math.abs(cardCenter - scrollX);
      const scale = Math.max(0.88, 1 - dist * 0.00035);
      const opacity = Math.max(0.55, 1 - dist * 0.0009);
      const rotateY = Math.max(-10, Math.min(10, (cardCenter - scrollX) * 0.02));

      cardStyle = {
        transform: `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
        opacity,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease-out',
      };
    }

    return (
      <article
        key={post.id}
        className={styles.card}
        style={cardStyle}
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
          const pat =
            post.media.patternId === 'custom' && post.media.items
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
            <PostImage
              src={post.media.url}
              alt={post.media.alt ?? 'медиа'}
              className={styles.mediaFill}
              style={{ objectFit: 'cover' }}
            />
          </button>
        )}

        {post.text ? (
          <p
            className={styles.text}
            style={{
              fontSize: post.media?.fontSize ? `${post.media.fontSize}px` : undefined,
              fontFamily:
                post.media?.fontFamily === 'serif'
                  ? 'serif'
                  : post.media?.fontFamily === 'mono'
                  ? 'monospace'
                  : undefined,
            }}
          >
            {post.text}
          </p>
        ) : null}

        <footer className={styles.actions}>
          <button
            type="button"
            className={liked ? styles.liked : ''}
            aria-label={liked ? 'Убрать отметку «нравится»' : 'Нравится'}
            aria-pressed={liked}
            onClick={() => toggleLike(post.id)}
          >
            <Heart
              size={iconProps.size.sm}
              fill={liked ? 'currentColor' : 'none'}
              strokeWidth={iconProps.strokeWidth}
            />
            <span className={styles.tBadge} data-open={post.likedBy.length > 0}>
              <span className={styles.tBadgeDot}>{post.likedBy.length}</span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Комментарии"
            onClick={() => setCommentPostId(post.id)}
          >
            <MessageCircle size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
            <span className={styles.tBadge} data-open={post.comments.length > 0}>
              <span className={styles.tBadgeDot}>{post.comments.length}</span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Опубликовать у себя"
            onClick={() => repostToProfile(post.id)}
          >
            <Repeat2 size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
          </button>
          <button
            type="button"
            aria-label="Переслать в чат"
            onClick={() => setForwardPostId(post.id)}
          >
            <Forward size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
          </button>
          <button
            type="button"
            title="Ссылка"
            aria-label="Скопировать ссылку на пост"
            onClick={async () => {
              try {
                await copyShareLink('post', post.id, token);
                showToast('Ссылка на пост скопирована');
              } catch (e: any) {
                showToast(e.message || 'Ошибка');
              }
            }}
          >
            <Link2 size={iconProps.size.sm} strokeWidth={iconProps.strokeWidth} />
          </button>
        </footer>
      </article>
    );
  };

  const currentMobilePortion = mobilePortions[portionIndex] || [];

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <h1>Стена</h1>
          {isDesktop && feed.length > 0 && (
            <div className={styles.desktopControls}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handlePrevDesktop}
                disabled={scrollX <= 0}
                aria-label="Назад"
              >
                <ChevronLeft size={18} />
              </button>
              <span className={styles.desktopHint}>
                <Sparkles size={13} />
                <span>Колёсико — лисание справа налево</span>
              </span>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handleNextDesktop}
                disabled={scrollX >= (feed.length - 1) * 440}
                aria-label="Вперед"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      <PostComposer from="wall" collapsedPlaceholder="Расскажите о себе…" />

      {/* Main Wall Content Viewport */}
      <div
        className={styles.viewport}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {feed.length === 0 && booting ? (
          <div className={styles.skeletonWrap}>
            <SkeletonList count={3} kind="post" />
          </div>
        ) : feed.length === 0 ? (
          <div className={styles.empty}>Пока тихо. Напишите первый пост.</div>
        ) : isDesktop ? (
          /* Desktop Horizontal Fluid Deck (Right-to-Left gliding) */
          <div className={styles.desktopDeckContainer}>
            <div
              ref={trackRef}
              className={styles.desktopDeckTrack}
              style={{ transform: `translateX(-${scrollX}px)` }}
            >
              {feed.map((post, idx) => renderPostCard(post, idx))}
            </div>
          </div>
        ) : (
          /* Mobile Swipe Portion Deck */
          <div
            className={`${styles.mobilePortionDeck} ${
              animatingPortion ? styles.mobilePortionAnim : ''
            }`}
            style={{
              transform: `translateX(${touchDeltaX * 0.6}px)`,
              transition: touchStartX === null ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
            }}
          >
            {currentMobilePortion.map((post, idx) => renderPostCard(post, idx))}
          </div>
        )}
      </div>

      {/* Mobile Floating Minimalist Arrow Button for Portion Swiping */}
      {!isDesktop && feed.length > 0 && (
        <div className={styles.mobileFloatingBar}>
          {portionIndex > 0 && (
            <button
              type="button"
              className={styles.mobileBackArrowBtn}
              onClick={triggerPrevPortion}
              aria-label="Предыдущая порция"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <div className={styles.portionPill}>
            <span>Порция {portionIndex + 1} из {Math.max(1, mobilePortions.length)}</span>
          </div>

          <button
            type="button"
            className={styles.mobileNextArrowBtn}
            onClick={triggerNextPortion}
            aria-label="Следующая порция"
          >
            <ChevronRight size={20} className={styles.arrowIconPulse} />
          </button>
        </div>
      )}

      <MediaLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
