import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import styles from './CircleSheet.module.css';
import { uploadFile } from '../../shared/lib/api';

export function CircleSheet() {
  const open = useAppStore((s) => s.circleSheetOpen);
  const setCircleSheetOpen = useAppStore((s) => s.setCircleSheetOpen);
  const showToast = useAppStore((s) => s.showToast);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [camera, setCamera] = useState<'user' | 'environment'>('user');
  const [flash, setFlash] = useState(false);
  const [recording, setRecording] = useState(false);
  const [hasCam, setHasCam] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  const stopStream = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
        // 320×320 давало заметное мыло на современных экранах. 640 — вдвое
        // чётче; ideal, а не exact, чтобы слабая камера не отказала совсем.
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
          frameRate: { ideal: 30 },
        },
        audio: {
          autoGainControl: true,
          noiseSuppression: true,
          echoCancellation: true,
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setHasCam(true);
    } catch (err) {
      console.error('Error starting camera stream:', err);
      setHasCam(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setRecording(false);
      setFlash(false);
      stopStream();
      return;
    }
    void startCam(camera);
    return () => stopStream();
  }, [open]);

  useEffect(() => {
    if (recording && duration >= 15) {
      stopRecording();
    }
  }, [recording, duration]);

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

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    
    let options: MediaRecorderOptions = { 
      mimeType: 'video/webm;codecs=vp9,opus',
      // 250 кбит/с хватало только на 320px. Для 640px нужно втрое больше;
      // 15 секунд при 1.5 Мбит/с — около 2.8 МБ, лимит загрузки 10 МБ.
      videoBitsPerSecond: 1500000,
      audioBitsPerSecond: 64000
    };
    if (!MediaRecorder.isTypeSupported(options.mimeType as string)) {
      options = { ...options, mimeType: 'video/webm;codecs=vp8,opus' };
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType as string)) {
      options = { ...options, mimeType: 'video/webm' };
    }
    
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(streamRef.current, options);
    } catch {
      recorder = new MediaRecorder(streamRef.current);
    }
    
    mediaRecorderRef.current = recorder;
    
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };
    
    recorder.onstop = async () => {
      const durationSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
      if (chunksRef.current.length > 0) {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'video/webm' });
        const file = new File([blob], 'circle.webm', { type: blob.type });
        
        const token = useAppStore.getState().token;
        const chatId = useAppStore.getState().activeChatId;
        const sendMessage = useAppStore.getState().sendMessage;
        
        if (chatId) {
          try {
            showToast('Отправка кружка...');
            
            const circleMime = (file.type || 'video/webm').split(';')[0] || 'video/webm';
            const { url } = await uploadFile(
              file,
              { kind: 'circle', purpose: 'circle', mime: circleMime },
              token
            );

            await sendMessage('Видеосообщение', {
              kind: 'circle',
              media: {
                url,
                durationSec,
                filename: 'circle.webm',
                mime: file.type,
                size: file.size
              }
            });
            showToast('Кружок отправлен');
          } catch (err: any) {
            console.error('Failed to upload circle video:', err);
            showToast('Не удалось отправить кружок');
          }
        }
      }
      setCircleSheetOpen(false);
    };
    
    recorder.start();
    startTimeRef.current = Date.now();
    setRecording(true);
    setDuration(0);
    
    timerRef.current = window.setInterval(() => {
      setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="Кружок">
      <div className={styles.stage}>
        <div
          className={styles.circle}
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
              {recording ? '● запись…' : 'камера/микрофон недоступны'}
            </span>
          )}
          {recording && hasCam && <span className={styles.recDot}>●</span>}
          {flash && camera === 'environment' && (
            <span className={styles.flash}>⚡</span>
          )}
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
              if (recording) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
          >
            {recording ? `${duration}с` : '●'}
          </button>
          <button type="button" onClick={() => setCircleSheetOpen(false)}>
            ✕
          </button>
        </div>

        {/* Панель «Эффекты (спрятаны)» удалена: кнопки blur/cat/dog
            только меняли CSS-класс и ничего не делали. Заглушка в интерфейсе
            хуже её отсутствия — она обещает то, чего нет. */}
      </div>
    </div>
  );
}
