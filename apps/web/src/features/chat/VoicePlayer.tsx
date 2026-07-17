import { useEffect, useRef, useState } from 'react';
import { Mic, Pause, Play } from 'lucide-react';
import styles from './VoicePlayer.module.css';
import { iconProps } from '../../shared/ui/icons';

interface VoicePlayerProps {
  src: string;
  durationSec?: number;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VoicePlayer({ src, durationSec = 0 }: VoicePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(durationSec);
  const [progress, setProgress] = useState(0);

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
    if (playing) {
      audio.pause();
    } else {
      void audio.play();
    }
  };

  const onScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const displayDuration = playing ? current : (current > 0 ? current : duration);

  return (
    <div className={styles.player}>
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        type="button"
        className={styles.playBtn}
        onClick={togglePlay}
        aria-label={playing ? 'Пауза' : 'Воспроизвести'}
      >
        {playing
          ? <Pause size={14} strokeWidth={iconProps.strokeWidth} />
          : <Play size={14} strokeWidth={iconProps.strokeWidth} />
        }
      </button>

      <div className={styles.track} onClick={onScrub}>
        {/* waveform bars — static decorative */}
        <div className={styles.bars} aria-hidden>
          {Array.from({ length: 28 }, (_, i) => {
            const barFilled = progress > 0 && i / 28 <= progress;
            const heights = [5, 9, 14, 7, 12, 16, 6, 10, 15, 8, 13, 11, 5, 14, 9, 12, 7, 15, 10, 6, 13, 8, 14, 11, 5, 10, 7, 12];
            return (
              <span
                key={i}
                className={`${styles.bar} ${barFilled ? styles.barFilled : ''} ${playing && barFilled ? styles.barPlaying : ''}`}
                style={{ height: `${heights[i % heights.length]}px` }}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.meta}>
        <Mic size={10} strokeWidth={iconProps.strokeWidth} className={styles.micIcon} />
        <span className={styles.time}>{formatTime(displayDuration)}</span>
      </div>
    </div>
  );
}
