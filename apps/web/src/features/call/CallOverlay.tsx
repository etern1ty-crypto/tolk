import { useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff } from 'lucide-react';
import { useAppStore, callMedia } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import styles from './CallOverlay.module.css';

export function CallOverlay() {
  const call = useAppStore((s) => s.call);
  const users = useAppStore((s) => s.users);
  const acceptCall = useAppStore((s) => s.acceptCall);
  const rejectCall = useAppStore((s) => s.rejectCall);
  const endCall = useAppStore((s) => s.endCall);
  const toggleMute = useAppStore((s) => s.toggleMute);
  const toggleCamera = useAppStore((s) => s.toggleCamera);
  const toggleScreenShare = useAppStore((s) => s.toggleScreenShare);

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);

  // Streams live outside the store (not serialisable); re-attach whenever the
  // call identity or its live/video state changes — ontrack fills them lazily.
  const attachKey = call ? `${call.id}:${call.hasRemote}:${call.video}:${call.screen}` : '';
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = callMedia.remote();
    if (localRef.current) localRef.current.srcObject = callMedia.local();
  }, [attachKey]);

  if (!call) return null;

  const peer = users[call.peerId];
  const name = peer?.displayName || peer?.username || 'Собеседник';
  const incoming = call.direction === 'in' && call.status === 'ringing';
  const showVideo = call.video && (call.status === 'active' || call.status === 'connecting');

  const statusText =
    call.status === 'ringing' ? (incoming ? (call.video ? 'Входящий видеозвонок' : 'Входящий звонок') : 'Вызов…')
    : call.status === 'connecting' ? 'Соединение…'
    : call.status === 'active' ? (call.video ? '' : 'В разговоре')
    : 'Завершение…';

  return (
    <div className={styles.overlay} role="dialog" aria-label="Звонок">
      {/* Remote video fills the screen; audio calls show the avatar instead. */}
      {showVideo && call.hasRemote ? (
        <video ref={remoteRef} className={styles.remoteVideo} autoPlay playsInline />
      ) : (
        <div className={styles.avatarStage}>
          <Avatar name={name} id={call.peerId} avatarUrl={peer?.avatarRef} size={120} />
        </div>
      )}
      {/* Hidden audio sink so audio-only calls are audible (video tag paused). */}
      {!showVideo && <video ref={remoteRef} autoPlay playsInline style={{ display: 'none' }} />}

      {/* Local self-view PiP, only in video calls. */}
      {showVideo && (
        <video ref={localRef} className={styles.localVideo} autoPlay playsInline muted />
      )}

      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        {statusText && <div className={styles.status}>{statusText}</div>}
      </div>

      <div className={styles.controls}>
        {incoming ? (
          <>
            <button className={`${styles.round} ${styles.decline}`} onClick={rejectCall} aria-label="Отклонить">
              <PhoneOff size={26} />
            </button>
            <button className={`${styles.round} ${styles.accept}`} onClick={acceptCall} aria-label="Принять">
              <Phone size={26} />
            </button>
          </>
        ) : (
          <>
            <button className={styles.round} onClick={toggleMute} aria-label={call.muted ? 'Включить микрофон' : 'Выключить микрофон'}>
              {call.muted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            {call.video && (
              <button className={styles.round} onClick={toggleCamera} aria-label={call.camOff ? 'Включить камеру' : 'Выключить камеру'}>
                {call.camOff ? <VideoOff size={24} /> : <Video size={24} />}
              </button>
            )}
            {call.video && (
              <button className={`${styles.round} ${call.screen ? styles.on : ''}`} onClick={toggleScreenShare} aria-label="Демонстрация экрана">
                {call.screen ? <ScreenShareOff size={24} /> : <ScreenShare size={24} />}
              </button>
            )}
            <button className={`${styles.round} ${styles.decline}`} onClick={endCall} aria-label="Завершить">
              <PhoneOff size={26} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
