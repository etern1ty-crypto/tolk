import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import styles from './MessageVoiceBubble.module.css';
import { iconProps } from '../../shared/ui/icons';

interface VoicePlayerProps {
  src: string;
  durationSec?: number;
  /** seed for deterministic Tolk waveform (message id) */
  seed?: string;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Deterministic PRNG for unique-but-stable wave shapes per message */
function mulberry32(a: number) {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Tolk voice bubble — monochrome “ink bars” waveform (not Telegram-style).
 * Bars breathe while playing; progress lights bars left→right.
 */
export function VoicePlayer({ src, durationSec = 0, seed = src }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [progress, setProgress] = useState(0);

  const bars = useMemo(() => {
    const rng = mulberry32(hashSeed(seed || 'tolk'));
    const n = 36;
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      // Envelope: quieter at ends, richer mid — “ink stroke”
      const t = i / (n - 1);
      const envelope = 0.35 + 0.65 * Math.sin(Math.PI * t);
      const noise = 0.45 + rng() * 0.55;
      out.push(Math.round(4 + envelope * noise * 18));
    }
    return out;
  }, [seed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrent(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => {
      setPlaying(false);
      setCurrent(0);
      setProgress(0);
      audio.currentTime = 0;
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) audio.pause();
    else void audio.play();
  };

  const onScrub = (e: React.MouseEvent<HTMLDivElement> | React.PointerEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : 0;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const displayDuration = playing || current > 0 ? current : duration;

  return (
    <div className={`${styles.player} ${playing ? styles.playing : ''}`}>
      {src ? <audio ref={audioRef} src={src} preload="metadata" /> : null}

      <button
        type="button"
        className={styles.playBtn}
        onClick={togglePlay}
        disabled={!src}
        aria-label={playing ? 'Пауза' : 'Воспроизвести'}
      >
        {playing ? (
          <Pause size={15} strokeWidth={iconProps.strokeWidth} />
        ) : (
          <Play size={15} strokeWidth={iconProps.strokeWidth} />
        )}
      </button>

      <div className={styles.track} onClick={onScrub} role="slider" aria-valuenow={Math.round(progress * 100)}>
        <div className={styles.bars} aria-hidden>
          {bars.map((h, i) => {
            const filled = progress > 0 && i / bars.length <= progress;
            return (
              <span
                key={i}
                className={`${styles.bar} ${filled ? styles.barFilled : ''} ${
                  playing && filled ? styles.barLive : ''
                }`}
                style={
                  {
                    '--h': `${h}px`,
                    '--i': i,
                  } as React.CSSProperties
                }
              />
            );
          })}
        </div>
        <div className={styles.progressLine} style={{ width: `${progress * 100}%` }} />
      </div>

      <span className={styles.time}>{formatTime(displayDuration)}</span>
    </div>
  );
}
