import { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, X, SkipBack, SkipForward } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './GlobalMediaPlayer.module.css';
import { iconProps } from '../../shared/ui/icons';
function formatTime(sec: number) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function GlobalMediaPlayer() {
  const activeMediaId = useAppStore((s) => s.activeMediaId);
  const setActiveMediaId = useAppStore((s) => s.setActiveMediaId);
  const activeChatId = useAppStore((s) => s.activeChatId);
  const messages = useAppStore((s) => s.messages);

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const frameRef = useRef<number | undefined>(undefined);

  const mediaMessages = useMemo(() => {
    return messages
      .filter((m) => m.chatId === activeChatId && (m.kind === 'voice' || m.kind === 'circle'))
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, activeChatId]);

  const currentIndex = useMemo(() => {
    return mediaMessages.findIndex((m) => m.id === activeMediaId);
  }, [mediaMessages, activeMediaId]);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < mediaMessages.length - 1 && currentIndex !== -1;

  useEffect(() => {
    if (!activeMediaId) {
      mediaRef.current?.pause();
      mediaRef.current = null;
      setPlaying(false);
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    const bind = (el: HTMLMediaElement) => {
      mediaRef.current = el;
      if (el.paused) el.play().catch(() => {});
      setPlaying(!el.paused);
      setDuration(el.duration || 0);

      const updateLoop = () => {
        const m = mediaRef.current;
        if (!m) return;
        setCurrentTime(m.currentTime);
        setProgress(m.duration ? m.currentTime / m.duration : 0);
        frameRef.current = requestAnimationFrame(updateLoop);
      };

      const onEnded = () => {
        setPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        if (currentIndex < mediaMessages.length - 1 && currentIndex !== -1) {
          const next = mediaMessages[currentIndex + 1];
          if (next) setActiveMediaId(next.id);
        }
      };
      const onPlay = () => {
        setPlaying(true);
        frameRef.current = requestAnimationFrame(updateLoop);
      };
      const onPause = () => {
        setPlaying(false);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
      const onDuration = () => setDuration(el.duration || 0);

      el.addEventListener('ended', onEnded);
      el.addEventListener('play', onPlay);
      el.addEventListener('pause', onPause);
      el.addEventListener('durationchange', onDuration);

      if (!el.paused) frameRef.current = requestAnimationFrame(updateLoop);

      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('play', onPlay);
        el.removeEventListener('pause', onPause);
        el.removeEventListener('durationchange', onDuration);
      };
    };

    const found = document.querySelector(
      `[data-media-id="${activeMediaId}"]`
    ) as HTMLMediaElement | null;

    if (found) {
      cleanup = bind(found);
    } else {
      // Voice audio may mount a tick later
      const t = window.setTimeout(() => {
        if (cancelled) return;
        const later = document.querySelector(
          `[data-media-id="${activeMediaId}"]`
        ) as HTMLMediaElement | null;
        if (!later) {
          setActiveMediaId(null);
          return;
        }
        cleanup = bind(later);
      }, 50);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
        cleanup?.();
      };
    }

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [activeMediaId, setActiveMediaId, currentIndex, mediaMessages]);

  const togglePlay = () => {
    if (mediaRef.current) {
      if (playing) mediaRef.current.pause();
      else mediaRef.current.play();
    }
  };

  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mediaRef.current || !mediaRef.current.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    mediaRef.current.currentTime = ratio * mediaRef.current.duration;
    setProgress(ratio);
    setCurrentTime(mediaRef.current.currentTime);
  };

  const skipBack = () => {
    if (hasPrev) {
      const prev = mediaMessages[currentIndex - 1];
      setActiveMediaId(prev.id);
    }
  };

  const skipForward = () => {
    if (hasNext) {
      const next = mediaMessages[currentIndex + 1];
      setActiveMediaId(next.id);
    }
  };

  if (!activeMediaId) return null;

  return (
    <div className={styles.root}>
      <div className={styles.controls}>
        <button type="button" className={styles.skipBtn} onClick={skipBack} disabled={!hasPrev} style={{ opacity: hasPrev ? 1 : 0.4 }}>
          <SkipBack size={18} strokeWidth={iconProps.strokeWidth} />
        </button>
        <button type="button" className={styles.playBtn} onClick={togglePlay}>
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
        </button>
        <button type="button" className={styles.skipBtn} onClick={skipForward} disabled={!hasNext} style={{ opacity: hasNext ? 1 : 0.4 }}>
          <SkipForward size={18} strokeWidth={iconProps.strokeWidth} />
        </button>
      </div>

      <div className={styles.scrubber} onMouseDown={onScrub}>
        <div className={styles.track}>
          <div className={styles.fill} style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className={styles.time}>{formatTime(currentTime)} / {formatTime(duration)}</div>

      <button type="button" className={styles.closeBtn} onClick={() => setActiveMediaId(null)}>
        <X size={20} strokeWidth={iconProps.strokeWidth} />
      </button>
    </div>
  );
}
