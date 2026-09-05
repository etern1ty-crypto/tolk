import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  Maximize2,
  Minimize2,
  Volume2,
} from 'lucide-react';
import { useAppStore, callMedia, type CallState } from '../../store/appStore';
import { Avatar } from '../../shared/ui/Avatar';
import { useIsDesktop } from '../../shared/lib/useMediaQuery';
import { SwipeToAnswer } from './SwipeToAnswer';
import { useFloatingCall } from './useFloatingCall';
import styles from './CallOverlay.module.css';

export function CallOverlay() {
  const call = useAppStore((s) => s.call);
  return call ? <ActiveCall key={call.id} call={call} /> : null;
}
function ActiveCall({ call }: { call: CallState }) {
  const peer = useAppStore((s) => s.users[call.peerId]);
  const acceptCall = useAppStore((s) => s.acceptCall);
  const rejectCall = useAppStore((s) => s.rejectCall);
  const endCall = useAppStore((s) => s.endCall);
  const toggleMute = useAppStore((s) => s.toggleMute);
  const toggleCamera = useAppStore((s) => s.toggleCamera);
  const toggleScreenShare = useAppStore((s) => s.toggleScreenShare);
  const desktop = useIsDesktop();
  const [minimized, setMinimized] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [needsPlayback, setNeedsPlayback] = useState(false);
  const compact = desktop && minimized;
  const root = useRef<HTMLDivElement>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const drag = useFloatingCall(root, compact);
  const incoming = call.direction === 'in' && call.status === 'ringing';
  const showVideo = call.video && (call.status === 'active' || call.status === 'connecting');
  const name = peer?.displayName || peer?.username || 'Собеседник';
  const status =
    call.status === 'ringing'
      ? incoming
        ? call.video
          ? 'Входящий видеозвонок'
          : 'Входящий звонок'
        : 'Вызов…'
      : call.status === 'connecting'
        ? 'Соединение…'
        : call.status === 'active'
          ? 'В разговоре'
          : 'Завершение…';

  // Keep both sinks mounted: minimizing must not interrupt media or lose audio.
  useEffect(() => {
    const remote = remoteRef.current,
      local = localRef.current;
    if (remote) {
      const stream = callMedia.remote();
      if (remote.srcObject !== stream) remote.srcObject = stream;
      if (stream)
        void remote
          .play()
          .then(() => setNeedsPlayback(false))
          .catch(() => setNeedsPlayback(true));
    }
    if (local) {
      local.srcObject = callMedia.local();
      if (local.srcObject) void local.play().catch(() => {});
    }
  }, [call.id, call.hasRemote, call.video, call.screen, call.status]);

  useEffect(() => {
    if (compact) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const node = root.current;
    node?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && desktop) {
        e.preventDefault();
        setMinimized(true);
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(
        node?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]') ?? [],
      ).filter((el) => el.getClientRects().length > 0);
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (index < 0 || (!e.shiftKey && index === items.length - 1) || (e.shiftKey && index === 0)) {
        e.preventDefault();
        items[e.shiftKey ? items.length - 1 : 0].focus();
      }
    };
    node?.addEventListener('keydown', onKey);
    return () => {
      node?.removeEventListener('keydown', onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [compact, desktop]);

  const answer = async () => {
    if (accepting) return;
    setAccepting(true);
    try {
      await acceptCall();
    } catch {
      useAppStore.getState().showToast('Не удалось принять звонок');
    } finally {
      setAccepting(false);
    }
  };
  return createPortal(
    <div
      ref={root}
      tabIndex={-1}
      className={`${styles.overlay} ${compact ? styles.pip : ''}`}
      role={compact ? 'region' : 'dialog'}
      aria-modal={compact ? undefined : true}
      aria-label={`Звонок: ${name}`}
    >
      <video
        ref={remoteRef}
        className={styles.remoteVideo}
        autoPlay
        playsInline
        style={{ visibility: showVideo && call.hasRemote ? 'visible' : 'hidden' }}
      />
      {(!showVideo || !call.hasRemote) && (
        <div className={styles.avatarStage}>
          <Avatar
            name={name}
            id={call.peerId}
            avatarUrl={peer?.avatarRef}
            size={compact ? 56 : 120}
          />
        </div>
      )}
      <video
        ref={localRef}
        className={styles.localVideo}
        autoPlay
        playsInline
        muted
        style={{ display: showVideo && !call.camOff ? 'block' : 'none' }}
      />
      {desktop && (
        <div className={styles.windowBar}>
          {compact ? (
            <button
              {...drag}
              className={styles.dragHandle}
              type="button"
              aria-label="Переместить окно звонка, используйте стрелки"
            >
              {name}
            </button>
          ) : (
            <span />
          )}
          <button
            className={styles.windowButton}
            type="button"
            aria-label={compact ? 'Развернуть звонок' : 'Свернуть звонок'}
            onClick={() => setMinimized(!compact)}
          >
            {compact ? <Maximize2 size={18} /> : <Minimize2 size={20} />}
          </button>
        </div>
      )}
      <div className={styles.info}>
        <div className={styles.name}>{name}</div>
        <div className={styles.status} role="status">
          {status}
        </div>
      </div>
      {needsPlayback && (
        <button
          type="button"
          className={styles.playAudio}
          onClick={() => {
            void remoteRef.current
              ?.play()
              .then(() => setNeedsPlayback(false))
              .catch(() => useAppStore.getState().showToast('Не удалось включить звук'));
          }}
        >
          <Volume2 size={18} /> Включить звук
        </button>
      )}
      {incoming && !desktop && (
        <SwipeToAnswer disabled={accepting} onAnswer={() => void answer()} />
      )}
      <div className={styles.controls}>
        {incoming ? (
          <>
            <button
              type="button"
              className={`${styles.round} ${styles.decline}`}
              onClick={rejectCall}
              aria-label="Отклонить звонок"
            >
              <PhoneOff size={24} />
            </button>
            {desktop && (
              <button
                type="button"
                className={`${styles.round} ${styles.accept}`}
                disabled={accepting}
                onClick={() => void answer()}
                aria-label="Принять звонок"
              >
                <Phone size={24} />
              </button>
            )}
          </>
        ) : (
          <>
            <button
              type="button"
              className={styles.round}
              onClick={toggleMute}
              aria-pressed={call.muted}
              aria-label={call.muted ? 'Включить микрофон' : 'Выключить микрофон'}
            >
              {call.muted ? <MicOff size={22} /> : <Mic size={22} />}
            </button>
            {call.video && (
              <button
                type="button"
                className={styles.round}
                onClick={toggleCamera}
                aria-pressed={!call.camOff}
                aria-label={call.camOff ? 'Включить камеру' : 'Выключить камеру'}
              >
                {call.camOff ? <VideoOff size={22} /> : <Video size={22} />}
              </button>
            )}
            {call.video && (
              <button
                type="button"
                className={styles.round}
                aria-pressed={call.screen}
                onClick={() => void toggleScreenShare()}
                aria-label={call.screen ? 'Остановить демонстрацию экрана' : 'Демонстрация экрана'}
              >
                {call.screen ? <ScreenShareOff size={22} /> : <ScreenShare size={22} />}
              </button>
            )}
            <button
              type="button"
              className={`${styles.round} ${styles.decline}`}
              onClick={endCall}
              aria-label="Завершить звонок"
            >
              <PhoneOff size={24} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
