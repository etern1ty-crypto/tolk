import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './CircleSheet.module.css';

export function CircleSheet() {
  const open = useAppStore((s) => s.circleSheetOpen);
  const setCircleSheetOpen = useAppStore((s) => s.setCircleSheetOpen);
  const sendCircleMock = useAppStore((s) => s.sendCircleMock);
  const showEffects = useAppStore((s) => s.showCircleEffects);
  const setShowCircleEffects = useAppStore((s) => s.setShowCircleEffects);
  const showToast = useAppStore((s) => s.showToast);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camera, setCamera] = useState<'user' | 'environment'>('user');
  const [flash, setFlash] = useState(false);
  const [effect, setEffect] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [hasCam, setHasCam] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setHasCam(false);
  };

  const startCam = async (facing: 'user' | 'environment') => {
    stopStream();
    if (!navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setHasCam(true);
    } catch {
      setHasCam(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setRecording(false);
      setEffect(null);
      setShowCircleEffects(false);
      setFlash(false);
      stopStream();
      return;
    }
    void startCam(camera);
    return () => stopStream();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void startCam(camera);
  }, [camera]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCircleSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setCircleSheetOpen]);

  useEffect(() => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || typeof track.getCapabilities !== 'function') return;
    const caps = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };
    if (!caps.torch) return;
    void track.applyConstraints({
      advanced: [
        { torch: flash && camera === 'environment' } as MediaTrackConstraintSet,
      ],
    });
  }, [flash, camera, hasCam]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Кружок">
      <div className={styles.stage}>
        <div
          className={`${styles.circle} ${effect ? styles[`fx_${effect}`] : ''}`}
          data-cam={camera}
        >
          <video
            ref={videoRef}
            className={styles.video}
            playsInline
            muted
            autoPlay
          />
          {!hasCam && (
            <span className={styles.hint}>
              {recording ? '● запись…' : 'камера недоступна · mock ok'}
            </span>
          )}
          {recording && hasCam && <span className={styles.recDot}>●</span>}
          {flash && camera === 'environment' && (
            <span className={styles.flash}>⚡</span>
          )}
          {effect && <span className={styles.fxLabel}>{effect}</span>}
        </div>

        <div className={styles.toolbar}>
          <button
            type="button"
            onClick={() =>
              setCamera((c) => (c === 'user' ? 'environment' : 'user'))
            }
            title="Камера"
          >
            🔄
          </button>
          <button
            type="button"
            className={flash ? styles.on : ''}
            onClick={() => setFlash((f) => !f)}
            title="Вспышка"
            disabled={camera === 'user'}
          >
            ⚡
          </button>
          <button
            type="button"
            className={styles.rec}
            onClick={() => {
              if (recording) return;
              setRecording(true);
              window.setTimeout(() => {
                setRecording(false);
                sendCircleMock();
                showToast('Кружок отправлен');
              }, 1100);
            }}
          >
            {recording ? '…' : '●'}
          </button>
          <button type="button" onClick={() => setCircleSheetOpen(false)}>
            ✕
          </button>
        </div>

        <button
          type="button"
          className={styles.effectsEntry}
          onClick={() => setShowCircleEffects(!showEffects)}
        >
          ···
        </button>

        {showEffects && (
          <div className={styles.effects}>
            <p>Эффекты (спрятаны)</p>
            {['blur', 'cat', 'dog', 'none'].map((fx) => (
              <button
                key={fx}
                type="button"
                onClick={() => setEffect(fx === 'none' ? null : fx)}
              >
                {fx}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
