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

  // Desktop step index for centered focus card
  const [desktopIndex, setDesktopIndex] = useState(0);

  // Mobile single post view state & 1-time swipe hint
  const [mobilePostIndex, setMobilePostIndex] = useState(0);
  const [hasSwipedMobile, setHasSwipedMobile] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [animatingMobile, setAnimatingMobile] = useState(false);

  const wheelThrottleRef = useRef(false);

  const feed = useMemo(
    () =>
      posts
        .filter((p) => p.onWall)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts]
  );

  const maxIndex = Math.max(0, feed.length - 1);

  // Handle desktop mouse wheel stepping with smooth centering
  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (!isDesktop) return;

    // Resolve wheel conflict with scrollable text inside post cards
    const target = e.target as HTMLElement | null;
    const scrollableText = target?.closest('.' + styles.text);
    if (scrollableText) {
      const { scrollTop, scrollHeight, clientHeight } = scrollableText;
      const isScrollable = scrollHeight > clientHeight;
      if (isScrollable) {
        const delta = e.deltaY;
        const atTop = scrollTop <= 0 && delta < 0;
        const atBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight && delta > 0;
        if (!atTop && !atBottom) {
          // Allow native vertical text scrolling inside the post!
          return;
        }
      }
    }

    e.preventDefault();
    const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX;
    if (Math.abs(delta) < 10) return;
    if (wheelThrottleRef.current) return;

    wheelThrottleRef.current = true;
    setTimeout(() => {
      wheelThrottleRef.current = false;
    }, 280);

    if (delta > 0 && desktopIndex < maxIndex) {
      setDesktopIndex((idx) => {
        const next = Math.min(maxIndex, idx + 1);
        if (next >= maxIndex - 1 && feedHasMore) {
          void loadMoreFeed();
        }
        return next;
      });
    } else if (delta < 0 && desktopIndex > 0) {
      setDesktopIndex((idx) => Math.max(0, idx - 1));
    }
  };

  const handlePrevDesktop = () => {
    setDesktopIndex((idx) => Math.max(0, idx - 1));
  };

  const handleNextDesktop = () => {
    setDesktopIndex((idx) => {
      const next = Math.min(maxIndex, idx + 1);
      if (next >= maxIndex - 1 && feedHasMore) {
        void loadMoreFeed();
      }
      return next;
    });
  };

  // Mobile Touch Swipe Handlers (1 Post per screen)
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
    if (touchDeltaX < -50 && mobilePostIndex < maxIndex) {
      triggerNextMobilePost();
    } else if (touchDeltaX > 50 && mobilePostIndex > 0) {
      triggerPrevMobilePost();
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
  };

  const triggerNextMobilePost = () => {
    if (mobilePostIndex >= maxIndex) {
      if (feedHasMore) {
        void loadMoreFeed();
      }
      return;
    }
    if (!hasSwipedMobile) setHasSwipedMobile(true);
    setAnimatingMobile(true);
    setMobilePostIndex((idx) => Math.min(maxIndex, idx + 1));
    setTimeout(() => setAnimatingMobile(false), 300);
  };

  const triggerPrevMobilePost = () => {
    if (mobilePostIndex <= 0) return;
    if (!hasSwipedMobile) setHasSwipedMobile(true);
    setAnimatingMobile(true);
    setMobilePostIndex((idx) => Math.max(0, idx - 1));
    setTimeout(() => setAnimatingMobile(false), 300);
  };

  const renderPostCard = (post: typeof feed[0], index: number) => {
    const author = users[post.authorId];
    const liked = post.likedBy.includes(me.id);

    // Desktop Centered Focus styling (Active card in center, previews on left/right)
    let cardStyle: React.CSSProperties = {};
    let cardClass = styles.card;

    if (isDesktop) {
      const diff = index - desktopIndex;
      const isActive = diff === 0;

      if (isActive) {
        cardClass += ` ${styles.cardActive}`;
        cardStyle = {
          transform: 'perspective(1000px) scale(1) translateZ(0)',
          opacity: 1,
          zIndex: 10,
        };
      } else {
        const absDiff = Math.abs(diff);
        const scale = Math.max(0.82, 1 - absDiff * 0.12);
        const opacity = Math.max(0.35, 0.5 - (absDiff - 1) * 0.15);
        const rotateY = diff > 0 ? -12 : 12;

        cardStyle = {
          transform: `perspective(1000px) rotateY(${rotateY}deg) scale(${scale})`,
          opacity,
          zIndex: Math.max(1, 10 - absDiff),
        };
      }
    }

    return (
      <article key={post.id} className={cardClass} style={cardStyle}>
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

  const currentMobilePost = feed[mobilePostIndex] || null;

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
                disabled={desktopIndex <= 0}
                aria-label="Назад"
              >
                <ChevronLeft size={18} />
              </button>
              <span className={styles.desktopHint}>
                <Sparkles size={13} />
                <span>Колёсико — листание акцентных постов</span>
              </span>
              <button
                type="button"
                className={styles.navBtn}
                onClick={handleNextDesktop}
                disabled={desktopIndex >= maxIndex}
                aria-label="Вперед"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </header>

      <PostComposer from="wall" collapsedPlaceholder="Расскажите о себе…" />

      {/* Main Viewport Container */}
      <div
        className={styles.viewport}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {feed.length === 0 && booting ? (
          <div className={styles.skeletonWrap}>
            <SkeletonList count={2} kind="post" />
          </div>
        ) : feed.length === 0 ? (
          <div className={styles.empty}>Пока тихо. Напишите первый пост.</div>
        ) : isDesktop ? (
          /* Desktop Centered Fluid Deck (Active post centered + side previews) */
          <div className={styles.desktopDeckContainer}>
            <div
              className={styles.desktopDeckTrack}
              style={{
                transform: `translateX(calc(-${desktopIndex * 552}px))`,
              }}
            >
              {feed.map((post, idx) => renderPostCard(post, idx))}
            </div>
          </div>
        ) : (
          /* Mobile Single Post View (1 Post per Screen) */
          <div className={styles.mobileSingleViewport}>
            {currentMobilePost && (
              <div
                className={`${styles.mobileSingleCardWrap} ${
                  animatingMobile ? styles.mobileCardAnim : ''
                }`}
                style={{
                  transform: `translateX(${touchDeltaX * 0.65}px)`,
                  transition:
                    touchStartX === null
                      ? 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)'
                      : 'none',
                }}
              >
                {renderPostCard(currentMobilePost, mobilePostIndex)}
              </div>
            )}

            {/* 1-Time Semi-transparent Animated Swipe Hint on first Mobile post */}
            {mobilePostIndex === 0 && !hasSwipedMobile && (
              <div
                className={styles.mobileSwipeHintBanner}
                onClick={() => setHasSwipedMobile(true)}
              >
                <span className={styles.hintPulseDot} />
                <span>← Смахните влево для просмотра</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Floating Minimalist Arrow Button for 1-Post Navigation */}
      {!isDesktop && feed.length > 0 && (
        <div className={styles.mobileFloatingBar}>
          {mobilePostIndex > 0 && (
            <button
              type="button"
              className={styles.mobileBackArrowBtn}
              onClick={triggerPrevMobilePost}
              aria-label="Предыдущий пост"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          <button
            type="button"
            className={styles.mobileNextArrowBtn}
            onClick={triggerNextMobilePost}
            aria-label="Следующий пост"
          >
            <ChevronRight size={20} className={styles.arrowIconPulse} />
          </button>
        </div>
      )}

      <MediaLightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  );
}
