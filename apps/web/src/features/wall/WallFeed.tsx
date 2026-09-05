import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import {
  clamp,
  createSpring,
  projectMomentum,
  releaseVelocity,
  rubberBand,
  type PointerSample,
} from '../../shared/lib/motion';
import { triggerHaptic } from '../../shared/lib/haptics';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import { MediaLightbox } from '../../shared/ui/MediaLightbox';
import { SkeletonList } from '../../shared/ui/Skeleton';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import styles from './WallFeed.module.css';

export function WallFeed() {
  const desktop = useIsDesktop();
  const posts = useAppStore((s) => s.posts);
  const booting = useAppStore((s) => s.booting);
  const hasMore = useAppStore((s) => s.feedHasMore);
  const loadingMore = useAppStore((s) => s.feedLoadingMore);
  const refreshing = useAppStore((s) => s.feedRefreshing);
  const error = useAppStore((s) => s.feedError);
  const loadMore = useAppStore((s) => s.loadMoreFeed);
  const refreshFeed = useAppStore((s) => s.refreshFeed);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [armed, setArmed] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const spring = useRef<ReturnType<typeof createSpring> | null>(null);
  const pointerId = useRef<number | null>(null);
  const refreshingRef = useRef(false);
  const feed = useMemo(
    () => posts.filter((p) => p.onWall).sort((a, b) => b.createdAt - a.createdAt),
    [posts],
  );

  const refresh = useCallback(
    async (pulled = false) => {
      if (refreshingRef.current || useAppStore.getState().feedRefreshing) return;
      refreshingRef.current = true;
      setArmed(false);
      if (pulled) spring.current?.to(56);
      try {
        await refreshFeed();
        if (!useAppStore.getState().feedError) triggerHaptic('success');
      } finally {
        refreshingRef.current = false;
        spring.current?.to(0);
      }
    },
    [refreshFeed],
  );

  useEffect(() => {
    const controller = createSpring(0, (y) => {
      if (contentRef.current) contentRef.current.style.transform = `translateY(${y}px)`;
      if (indicatorRef.current) {
        indicatorRef.current.style.opacity = String(clamp(y / 40, 0, 1));
        indicatorRef.current.style.transform = `translateY(${Math.min(12, y * 0.2)}px)`;
      }
    });
    spring.current = controller;
    return () => {
      controller.stop();
      spring.current = null;
    };
  }, []);

  // Direction-sensitive native touch interception: pointermove.preventDefault cannot
  // cancel a browser pan. Only a downward pull at scrollTop=0 is intercepted.
  // All other touch scrolling (and ALL wheel scrolling) remains browser-owned.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || desktop) return;
    let drag: {
      id: number;
      x: number;
      y: number;
      samples: PointerSample[];
      captured: boolean;
    } | null = null;
    const start = (e: TouchEvent) => {
      if (
        e.touches.length !== 1 ||
        el.scrollTop > 0 ||
        refreshingRef.current ||
        useAppStore.getState().feedRefreshing
      )
        return;
      if ((e.target as HTMLElement).closest('input, textarea, button, a, [contenteditable=true]'))
        return;
      const t = e.touches[0];
      spring.current?.stop();
      drag = {
        id: t.identifier,
        x: t.clientX,
        y: t.clientY,
        captured: false,
        samples: [{ position: spring.current?.value ?? 0, time: e.timeStamp }],
      };
    };
    const move = (e: TouchEvent) => {
      if (!drag) return;
      if (e.touches.length !== 1) {
        drag = null;
        spring.current?.to(0);
        return;
      }
      const t = Array.from(e.touches).find((touch) => touch.identifier === drag?.id);
      if (!t) return;
      const dy = t.clientY - drag.y,
        dx = t.clientX - drag.x;
      if (!drag.captured && (dy < 0 || Math.abs(dx) > Math.abs(dy))) {
        drag = null;
        spring.current?.to(0);
        return;
      }
      if (dy <= 0 && !drag.captured) return;
      if (e.cancelable) e.preventDefault();
      if (!drag.captured && pointerId.current !== null) {
        try {
          el.setPointerCapture(pointerId.current);
        } catch {
          /* Already cancelled by the UA. */
        }
      }
      drag.captured = true;
      const y = rubberBand(Math.max(0, dy), 300);
      spring.current?.set(y);
      drag.samples.push({ position: y, time: e.timeStamp });
      drag.samples = drag.samples.filter((s) => e.timeStamp - s.time < 120);
      setArmed(y >= 64);
    };
    const finish = (e: TouchEvent) => {
      if (!drag) return;
      const d = drag;
      drag = null;
      const y = spring.current?.value ?? 0;
      d.samples.push({ position: y, time: e.timeStamp });
      const velocity = releaseVelocity(d.samples, e.timeStamp);
      if (pointerId.current !== null && el.hasPointerCapture(pointerId.current))
        el.releasePointerCapture(pointerId.current);
      if (e.type !== 'touchcancel' && d.captured && y > 24 && projectMomentum(y, velocity) >= 64)
        void refresh(true);
      else {
        setArmed(false);
        spring.current?.to(0, { velocity: e.type === 'touchcancel' ? 0 : velocity });
      }
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: false });
    el.addEventListener('touchend', finish);
    el.addEventListener('touchcancel', finish);
    return () => {
      el.removeEventListener('touchstart', start);
      el.removeEventListener('touchmove', move);
      el.removeEventListener('touchend', finish);
      el.removeEventListener('touchcancel', finish);
    };
  }, [desktop, refresh]);

  useEffect(() => {
    if (!hasMore || loadingMore || refreshing || error || !feed.length || !sentinelRef.current)
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void loadMore();
      },
      { root: viewportRef.current, rootMargin: '240px' },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, refreshing, error, feed.length, loadMore]);

  return (
    <section className={styles.root} aria-label="Стена">
      <header className={styles.header}>
        <h1>Стена</h1>
        <button
          type="button"
          aria-label="Обновить ленту"
          disabled={refreshing || booting}
          onClick={() => void refresh()}
        >
          <RefreshCw size={20} className={refreshing ? styles.spinning : ''} />
        </button>
      </header>
      <div ref={indicatorRef} className={styles.refreshIndicator} aria-hidden="true">
        <RefreshCw size={18} className={refreshing ? styles.spinning : ''} />
        <span>
          {refreshing
            ? 'Обновляем…'
            : armed
              ? 'Отпустите, чтобы обновить'
              : 'Потяните, чтобы обновить'}
        </span>
      </div>
      <div
        ref={viewportRef}
        className={styles.viewport}
        data-wall-scroll
        onPointerDownCapture={(e) => {
          if (e.isPrimary) pointerId.current = e.pointerId;
        }}
      >
        <div ref={contentRef} className={styles.stream}>
          <PostComposer from="wall" collapsedPlaceholder="Что нового?" />
          {error && (
            <div className={styles.error} role="status">
              <span>{error}</span>
              <button type="button" onClick={() => void refresh()}>
                Обновить
              </button>
            </div>
          )}
          {!feed.length && booting ? (
            <SkeletonList count={2} kind="post" />
          ) : !feed.length && !error ? (
            <div className={styles.empty}>Пока тихо. Напишите первый пост.</div>
          ) : (
            feed.map((post) => <PostCard key={post.id} post={post} onOpenImage={setLightbox} />)
          )}
          <div ref={sentinelRef} className={styles.loadMore}>
            {hasMore && feed.length > 0 && (
              <button
                type="button"
                disabled={loadingMore || refreshing}
                onClick={() => void loadMore()}
              >
                {loadingMore ? 'Загружаем…' : 'Загрузить ещё'}
              </button>
            )}
          </div>
        </div>
      </div>
      <div className={styles.srOnly} role="status">
        {refreshing ? 'Обновление ленты' : loadingMore ? 'Загрузка постов' : ''}
      </div>
      <MediaLightbox src={lightbox} onClose={() => setLightbox(null)} />
    </section>
  );
}
