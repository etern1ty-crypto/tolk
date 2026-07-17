import { useEffect, useState, useRef, useMemo } from 'react';
import { Play, Pause, X, SkipBack, SkipForward } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import styles from './GlobalMediaPlayer.module.css';
import { iconProps } from '../../shared/ui/icons';
import { motion, AnimatePresence } from 'framer-motion';

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

    const media = document.querySelector(`[data-media-id="${activeMediaId}"]`) as HTMLMediaElement;
    if (!media) {
      setActiveMediaId(null);
      return;
    }
    
    mediaRef.current = media;
    
    // Auto-play when active
    media.play().catch(() => {});
    setPlaying(!media.paused);
    setDuration(media.duration || 0);

    const updateLoop = () => {
      setCurrentTime(media.currentTime);
      setProgress(media.duration ? media.currentTime / media.duration : 0);
      frameRef.current = requestAnimationFrame(updateLoop);
    };

    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      // Auto-advance to next media if exists!
      if (currentIndex < mediaMessages.length - 1 && currentIndex !== -1) {
        const next = mediaMessages[currentIndex + 1];
        setActiveMediaId(next.id);
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
    const onDuration = () => setDuration(media.duration);

    media.addEventListener('ended', onEnded);
    media.addEventListener('play', onPlay);
    media.addEventListener('pause', onPause);
    media.addEventListener('durationchange', onDuration);

    if (!media.paused) {
      frameRef.current = requestAnimationFrame(updateLoop);
    } else {
      updateLoop(); // run once to init
      cancelAnimationFrame(frameRef.current!);
    }

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      media.removeEventListener('ended', onEnded);
      media.removeEventListener('play', onPlay);
      media.removeEventListener('pause', onPause);
      media.removeEventListener('durationchange', onDuration);
      media.pause(); // Stop when unmounted/swapped
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

  return (
    <AnimatePresence>
      {activeMediaId && (
        <motion.div 
          className={styles.root}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
